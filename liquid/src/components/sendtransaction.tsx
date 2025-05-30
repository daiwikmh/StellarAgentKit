import { useState } from "react";
import * as StellarSdk from "stellar-sdk";
import { signTransaction, getPublicKey, connect } from "@/lib/stellar";
import { toast } from "sonner";

const SendMoney = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      // Step 1: Validate inputs
      if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipient)) {
        throw new Error("Invalid recipient address.");
      }
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Amount must be a positive number.");
      }

      // Step 2: Check wallet connection
      const walletPublicKey = await getPublicKey();
      const sourcePublicKey = "GA7VQ7K2GVKG3T44TTYMKUGG56EMXJWSJY4P4AS2EJHSJRGZTFN3MKBF"; // Replace with dynamic key if needed
      if (!walletPublicKey) {
        await connect(); // Open wallet selection modal
        throw new Error("Please connect a wallet.");
      }
      if (walletPublicKey !== sourcePublicKey) {
        throw new Error("Connected wallet does not match the source public key.");
      }

      // Step 3: Create an unsigned transaction
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      const account = await server.loadAccount(sourcePublicKey);
      console.log("Account:", account);
      console.log("Source Public Key:", sourcePublicKey);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipient,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(300) // 300 seconds
        .build();

      const unsignedXdr = transaction.toXDR();
      console.log("Unsigned XDR:", unsignedXdr);

      // Step 4: Sign the transaction
      const signedResponse = await signTransaction(unsignedXdr, {
        networkPassphrase: StellarSdk.Networks.TESTNET,
        address: sourcePublicKey,
        submit: false, // We'll submit manually
      });
      console.log("Signed XDR:", signedResponse.signedTxXdr);

      // Step 5: Submit the transaction
      const tx = new StellarSdk.Transaction(
        signedResponse.signedTxXdr,
        StellarSdk.Networks.TESTNET
      );
      const response = await server.submitTransaction(tx);
      console.log("Submission Response:", response);

      setResult(`Transaction successful! Hash: ${response.hash}`);
      toast.success("Transaction submitted successfully!");
    } catch (error) {
      const errorMessage = (error as { response?: { data?: { title?: string } }, message?: string }).response?.data?.title || 
        (error as Error).message || 
        "Unknown error occurred";
      setResult(`Transaction failed: ${errorMessage}`);
      toast.error(`Transaction failed: ${errorMessage}`);
      console.error("Detailed error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Send XLM</h1>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};

export default SendMoney;
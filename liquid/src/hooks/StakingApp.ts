import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  // scValToNative,
  // xdr,
  Networks,
  BASE_FEE,
  Address,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@/lib/stellar";

// Configuration
const rpcUrl = "https://soroban-testnet.stellar.org";
const contractAddress = "CBTYOERLDPHPODHLZ7XKPUIJJTEZKYMBKEUA2JBCRPRMMDK6A4GM2UZF"; // Replace with actual deployed contract address
const networkPassphrase = Networks.TESTNET;

const addressToScVal = (address: string) => {
  // Validate address format
  if (!address.match(/^[CG][A-Z0-9]{55}$/)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  // Use Address directly or convert to ScVal
  return nativeToScVal(new Address(address), { type: "address" });
};

const numberToI128 = (value: number) => {
  return nativeToScVal(value, { type: "i128" });
};

const contractInt = async (caller: string, functName: string, values: any) => {
  try {
    const server = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
    const sourceAccount = await server.getAccount(caller).catch((err) => {
      throw new Error(`Failed to fetch account ${caller}: ${err.message}`);
    });

    const contract = new Contract(contractAddress);
    const params = {
      fee: BASE_FEE,
      networkPassphrase,
    };

    // Build transaction
    let transaction;
    const builder = new TransactionBuilder(sourceAccount, params);
    if (values == null) {
      transaction = builder
        .addOperation(contract.call(functName))
        .setTimeout(30)
        .build();
    } else if (Array.isArray(values)) {
      transaction = builder
        .addOperation(contract.call(functName, ...values))
        .setTimeout(30)
        .build();
    } else {
      transaction = builder
        .addOperation(contract.call(functName, values))
        .setTimeout(30)
        .build();
    }

    // Prepare and sign transaction
    const preparedTx = await server.prepareTransaction(transaction).catch((err) => {
      throw new Error(`Failed to prepare transaction: ${err.message}`);
    });
    const prepareTxXDR = preparedTx.toXDR();

    const signedTxResponse = await signTransaction(prepareTxXDR, {
      networkPassphrase: networkPassphrase
    }).catch((err) => {
      throw new Error(`Failed to sign transaction: ${err.message}`);
    });

    // Handle both string and object response from signTransaction
    const signedXDR = typeof signedTxResponse === 'string' 
      ? signedTxResponse 
      : signedTxResponse.signedTxXdr;

    const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
    const txResult = await server.sendTransaction(tx).catch((err) => {
      throw new Error(`Failed to send transaction: ${err.message}`);
    });

    let txResponse = await server.getTransaction(txResult.hash);
    const maxRetries = 30;
    let retries = 0;

    while (txResponse.status === "NOT_FOUND" && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      txResponse = await server.getTransaction(txResult.hash);
      retries++;
    }

    if (txResponse.status !== "SUCCESS") {
      throw new Error(`Transaction failed with status: ${txResponse.status}`);
    }


    return null; // No return value (e.g., for void functions)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in contract interaction (${functName}):`, errorMessage);
    throw error;
  }
};

// Contract interaction functions
async function initialize(caller: string, tokenAddress: string, rewardRate: number) {
  try {
    const tokenScVal = addressToScVal(tokenAddress);
    const rewardRateScVal = numberToI128(rewardRate);
    await contractInt(caller, "initialize", [tokenScVal, rewardRateScVal]);
    console.log("Contract initialized successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to initialize contract:", errorMessage);
    throw error;
  }
}

async function stake(caller: string, amount: number) {
  try {
    const userScVal = addressToScVal(caller);
    const amountScVal = numberToI128(amount);
    await contractInt(caller, "stake", [userScVal, amountScVal]);
    console.log(`Staked ${amount} successfully`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to stake:", errorMessage);
    throw error;
  }
}

async function unstake(caller: string, amount: number) {
  try {
    const userScVal = addressToScVal(caller);
    const amountScVal = numberToI128(amount);
    await contractInt(caller, "unstake", [userScVal, amountScVal]);
    console.log(`Unstaked ${amount} successfully`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to unstake:", errorMessage);
    throw error;
  }
}

async function claimRewards(caller: string) {
  try {
    const userScVal = addressToScVal(caller);
    await contractInt(caller, "claim_rewards", userScVal);
    console.log("Rewards claimed successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to claim rewards:", errorMessage);
    throw error;
  }
}

async function getStake(caller: string, userAddress: string) {
  try {
    const userScVal = addressToScVal(userAddress);
    const result = await contractInt(caller, "get_stake", userScVal);
    console.log(`Stake for ${userAddress}: ${result}`);
    return result; // Returns i128 as a BigInt
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch stake:", errorMessage);
    throw error;
  }
}

export { initialize, stake, unstake, claimRewards, getStake };
import React, { useState } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";
import { getShareId, deposit } from "@/hooks/LiquidationPool"; // Adjust path to LiquidationPool.ts
import { disconnect } from "@/lib/stellar";

const LiquidationPoolApp: React.FC = () => {
  // State for wallet and UI
  const [publicKey, setPublicKey] = useState<string>(""); // User's public key from Freighter
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false); // Wallet status
  const [shareId, setShareId] = useState<string | null>(null); // Share ID
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [message, setMessage] = useState<string>(""); // Feedback messages
  const [minA, setMinA] = useState<string>(""); // Minimum amount of token A
  const [desiredB, setDesiredB] = useState<string>(""); // Desired amount of token B
  const [minB, setMinB] = useState<string>(""); // Minimum amount of token B
  const [to, setTo] = useState<string>(""); // Recipient address
  const [desiredA, setDesiredA] = useState<string>(""); // Desired amount of token A

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (await isConnected()) {
        const response = await getAddress();
        setPublicKey(response.address);
        setIsWalletConnected(true);
        setMessage("Wallet connected successfully!");
      } else {
        setMessage("Freighter wallet not found. Please install the Freighter extension.");
      }
    } catch (error: any) {
      setMessage(`Error connecting wallet: ${error.message || error.toString()}`);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setPublicKey("");
      setIsWalletConnected(false);
      setShareId(null);
      setMessage("Wallet disconnected successfully!");
    } catch (error: any) {
      setMessage(`Error disconnecting wallet: ${error.message || error.toString()}`);
    }
  };

  // Fetch share ID
  const handleGetShareId = async () => {
    if (!isWalletConnected) {
      setMessage("Please connect your Freighter wallet.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const result = await getShareId(publicKey); // Pass publicKey as caller
      setShareId(result);
      setMessage("Share ID fetched successfully!");
    } catch (error: any) {
      setMessage(`Error fetching share ID: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      setMessage("Please connect your Freighter wallet.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await deposit(publicKey, to, desiredA, minA, desiredB, minB);
      setMessage("Deposit successful!");
      // Reset form
      setTo("");
      setDesiredA("");
      setMinA("");
      setDesiredB("");
      setMinB("");
    } catch (error: any) {
      setMessage(`Error depositing: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Liquidation Pool DApp</h1>
        {!isWalletConnected ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Connect Freighter Wallet
          </button>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGetShareId}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Fetching..." : "Get Share ID"}
              </button>
              {shareId && (
                <p className="text-sm text-gray-600">
                  Share ID: {shareId.slice(0, 6)}...{shareId.slice(-6)}
                </p>
              )}
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.includes("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LiquidationPoolApp;
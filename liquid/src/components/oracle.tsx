import { useState } from "react";
import { price, assets, Asset } from "@/hooks/myoracle"; // Adjust path to PriceOracle.ts
import { disconnect } from "@/lib/stellar";

// Assuming kit and getSelectedWalletId are imported or defined
// Replace with your actual imports or implementation
import { kit, getSelectedWalletId } from "@/lib/stellar"; // Example path, adjust as needed

// getPublicKey implementation
export async function getPublicKey() {
  if (!getSelectedWalletId()) return null;
  const { address } = await kit.getAddress();
  return address;
}

const PriceOracleApp: React.FC = () => {
  // State for wallet and UI
  const [publicKey, setPublicKey] = useState<string>(""); // User's public key from wallet
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false); // Wallet status
  const [supportedAssets, setSupportedAssets] = useState<Asset[] | null>(null); // List of supported assets
  const [assetType, setAssetType] = useState<"native" | "alphanum4" | "alphanum12">("native"); // Asset type
  const [assetCode, setAssetCode] = useState<string>(""); // Asset code for non-native
  const [assetIssuer, setAssetIssuer] = useState<string>(""); // Asset issuer for non-native
  const [timestamp, setTimestamp] = useState<string>(""); // Timestamp for price query
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [message, setMessage] = useState<string>(""); // Feedback messages

  // Connect wallet
  const connectWallet = async () => {
    try {
      const address = await getPublicKey();
      console.log("Wallet response:", { address });
      if (!address) {
        setMessage("No wallet selected or wallet not found. Please select a wallet.");
        return;
      }
      // Validate address format
      if (!/^[G][A-Z0-9]{55}$/.test(address)) {
        throw new Error("Invalid public key received from wallet");
      }
      setPublicKey(address);
      setIsWalletConnected(true);
      setMessage("Wallet connected successfully!");
      console.log("Public key set:", address);
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      setMessage(`Error connecting wallet: ${errorMessage}`);
      console.error("Wallet connection error:", errorMessage);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setPublicKey("");
      setIsWalletConnected(false);
      setSupportedAssets(null);
      setAssetType("native");
      setAssetCode("");
      setAssetIssuer("");
      setTimestamp("");
      setMessage("Wallet disconnected successfully!");
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      setMessage(`Error disconnecting wallet: ${errorMessage}`);
      console.error("Disconnect error:", errorMessage);
    }
  };

  // Validate asset inputs
  const isValidAsset = (): boolean => {
    if (assetType === "native") return true;
    return (
      /^[A-Za-z0-9]{1,12}$/.test(assetCode) &&
      /^[CG][A-Z0-9]{55}$/.test(assetIssuer)
    );
  };

  // Validate timestamp
  const isValidTimestamp = (): boolean => {
    return /^\d+$/.test(timestamp) && BigInt(timestamp) > 0;
  };

  // Fetch supported assets
  const handleGetAssets = async () => {
    if (!isWalletConnected) {
      setMessage("Please connect your wallet.");
      return;
    }
    if (!publicKey || !/^[G][A-Z0-9]{55}$/.test(publicKey)) {
      setMessage("Invalid wallet public key. Please reconnect your wallet.");
      console.error("Invalid publicKey:", publicKey);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      console.log("Fetching assets with publicKey:", publicKey);
      const result = await assets(publicKey);
      setSupportedAssets(result);
      setMessage(result ? "Assets fetched successfully!" : "No assets available.");
      console.log("Supported assets:", result);
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      setMessage(`Error fetching assets: ${errorMessage}`);
      console.error("Assets fetch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch price for an asset at a timestamp
  const handleGetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      setMessage("Please connect your wallet.");
      return;
    }
    if (!publicKey || !/^[G][A-Z0-9]{55}$/.test(publicKey)) {
      setMessage("Invalid wallet public key. Please reconnect your wallet.");
      return;
    }
    if (!isValidAsset()) {
      setMessage("Invalid asset code or issuer.");
      return;
    }
    if (!isValidTimestamp()) {
      setMessage("Invalid timestamp. Must be a positive integer (Unix timestamp in seconds).");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const asset: Asset = {
        type: assetType,
        ...(assetType !== "native" && { code: assetCode, issuer: assetIssuer }),
      };
      console.log("Fetching price with inputs:", { publicKey, asset, timestamp });
      const result = await price(publicKey, asset, timestamp);
      setMessage(
        result
          ? `Price: ${result.price} at timestamp ${result.timestamp}`
          : "No price data available for the given asset and timestamp."
      );
      console.log("Price result:", result);
      // Reset form
      setAssetType("native");
      setAssetCode("");
      setAssetIssuer("");
      setTimestamp("");
    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      setMessage(`Error fetching price: ${errorMessage}`);
      console.error("Price fetch error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Price Oracle DApp</h1>
        {!isWalletConnected ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGetAssets}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Fetching..." : "Get Supported Assets"}
              </button>
              {supportedAssets && (
                <div className="text-sm text-gray-600">
                  <p>Supported Assets:</p>
                  <ul className="list-disc pl-5">
                    {supportedAssets.map((asset, index) => (
                      <li key={index}>
                        {asset.type === "native"
                          ? "Native (XLM)"
                          : `${asset.code} (${asset.type}, Issuer: ${asset.issuer?.slice(0, 6)}...${asset.issuer?.slice(-6)})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form onSubmit={handleGetPrice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Asset Type
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value as any)}
                      disabled={loading}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="native">Native (XLM)</option>
                      <option value="alphanum4">Alphanum4</option>
                      <option value="alphanum12">Alphanum12</option>
                    </select>
                  </label>
                </div>
                {assetType !== "native" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Asset Code
                        <input
                          type="text"
                          value={assetCode}
                          onChange={(e) => setAssetCode(e.target.value)}
                          placeholder="e.g., USDC"
                          disabled={loading}
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Asset Issuer
                        <input
                          type="text"
                          value={assetIssuer}
                          onChange={(e) => setAssetIssuer(e.target.value)}
                          placeholder="G..."
                          disabled={loading}
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </label>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timestamp (seconds)
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g., 1697059200"
                      disabled={loading}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Fetching..." : "Get Price"}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Disconnect Wallet
                </button>
              </form>
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

export default PriceOracleApp;
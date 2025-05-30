import { useState } from 'react';
import { initialize } from '@/hooks/StakingApp'; // Adjust path to your contract.ts
import {
    isConnected,
    getAddress,
    
  } from "@stellar/freighter-api";
const StakingImpl: React.FC = () => {
  // State for user input and UI feedback
  const [publicKey, setPublicKey] = useState<string>(''); // User's public key from Freighter
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false); 
  const [tokenAddress, setTokenAddress] = useState<string>(''); 
  const [rewardRate, setRewardRate] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [message, setMessage] = useState<string>(''); 

  const connectWallet = async () => {
    try {
      if (await isConnected()) {
        const response = await getAddress();
        setPublicKey(response.address);
        setIsWalletConnected(true);
        setMessage('Wallet connected successfully!');
      } else {
        setMessage('Freighter wallet not found. Please install the Freighter extension.');
      }
    } catch (error: any) {
      setMessage(`Error connecting wallet: ${error.message || error.toString()}`);
    }
  };

  // Handle initialize function
  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!publicKey) {
        throw new Error('Please connect your Freighter wallet.');
      }
      if (!tokenAddress || !rewardRate) {
        throw new Error('Please provide a token address and reward rate.');
      }
      if (Number(rewardRate) <= 0) {
        throw new Error('Reward rate must be positive.');
      }

      await initialize(publicKey, tokenAddress, Number(rewardRate));
      setMessage('Contract initialized successfully!');

    } catch (error: any) {
      setMessage(`Error: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Initialize Staking Contract</h1>
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
            <form onSubmit={handleInitialize} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token Contract Address
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="CA..."
                    disabled={loading}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reward Rate (Tokens per Second)
                  <input
                    type="number"
                    value={rewardRate}
                    onChange={(e) => setRewardRate(e.target.value)}
                    placeholder="0.01"
                    step="0.0000001"
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
                {loading ? 'Processing...' : 'Initialize Contract'}
              </button>
            </form>
          </div>
        )}
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default StakingImpl;
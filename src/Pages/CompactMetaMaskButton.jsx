// src/Components/CompactMetaMaskButton.jsx
import React, { useState } from 'react';

const CompactMetaMaskButton = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const EQT_TOKEN = {
    address: '0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B',
    symbol: 'EQT',
    decimals: 18,
  };

  const addTokenToMetaMask = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature.');
      return;
    }

    setIsAdding(true);

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: EQT_TOKEN,
        },
      });

      if (wasAdded) {
        setIsAdded(true);
        alert(`✅ ${EQT_TOKEN.symbol} token successfully added to MetaMask!\n\nContract: ${EQT_TOKEN.address}`);
      }
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token. Please make sure you are on Celo Sepolia network.');
    } finally {
      setIsAdding(false);
    }
  };

  // If already added, show a success state
  if (isAdded) {
    return (
      <div className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
        <span>✅</span>
        <span>EQT Added</span>
        <button
          onClick={() => navigator.clipboard.writeText(EQT_TOKEN.address)}
          className="ml-2 text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition-colors"
          title="Copy contract address"
        >
          Copy Address
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      disabled={isAdding}
      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          <span>Adding...</span>
        </>
      ) : (
        <>
          <span className="text-xs">🦊</span>
          <span>Add to MetaMask</span>
        </>
      )}
    </button>
  );
};

export default CompactMetaMaskButton;
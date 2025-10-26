// src/Components/RealTradingInterface.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useUbeswapData from '../hooks/useUbeswapData';

const RealTradingInterface = () => {
  const { poolData, loading, error } = useUbeswapData();
  const [buyAmount, setBuyAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);

  // Calculate EQT amount based on real price
  useEffect(() => {
    if (poolData && buyAmount) {
      const celoAmount = parseFloat(buyAmount);
      if (!isNaN(celoAmount)) {
        const eqtAmount = celoAmount / poolData.eqtPrice;
        const minAmount = eqtAmount * (1 - slippage / 100);
        setReceiveAmount(minAmount.toFixed(6));
      }
    }
  }, [buyAmount, poolData, slippage]);

  const handleBuyEQT = async () => {
    if (!poolData || !buyAmount) return;
    
    // This would integrate with your trading contract
    console.log(`Buying ${receiveAmount} EQT for ${buyAmount} CELO`);
    // Your trading contract integration would go here
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">Loading Ubeswap data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">Trade EQT (Real Data)</h3>
      
      {/* Real Price Display */}
      {poolData && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg text-center">
          <div className="text-sm text-gray-400">Live Price from Ubeswap</div>
          <div className="text-lg font-bold">1 EQT = {poolData.celoPrice.toFixed(6)} CELO</div>
          <div className="text-sm text-gray-400">1 CELO = {poolData.eqtPrice.toFixed(6)} EQT</div>
        </div>
      )}

      {/* Buy Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Spend CELO</label>
        <input
          type="number"
          placeholder="0.00"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Receive EQT</label>
        <input
          type="number"
          placeholder="0.00"
          value={receiveAmount}
          readOnly
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-300"
        />
      </div>

      {/* Slippage Settings */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Slippage Tolerance: {slippage}%</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={handleBuyEQT}
        disabled={!buyAmount || !poolData}
        className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Buy EQT
      </button>

      {/* Pool Info */}
      {poolData && (
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Pool Liquidity:</span>
            <span>${(poolData.liquidity * poolData.celoPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>EQT in Pool:</span>
            <span>{poolData.reserves.eqt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>CELO in Pool:</span>
            <span>{poolData.reserves.celo.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTradingInterface;
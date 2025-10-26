// src/hooks/useUbeswapData.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Ubeswap addresses on Celo
const UBESWAP_ROUTER = '0xE3D8bd6Ced00f2A5F4F40bE3f6b209C6C69e5E9b';
const FACTORY_ADDRESS = '0x62d5b84bE28a183aBB507E125B384122D2C25fAE';

// Common token addresses on Celo
const CELO_TOKEN = '0x471EcE3750Da237f93B8E339c536989b8978a438';
const EQT_TOKEN = '0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B'; // Your EQT token

const useUbeswapData = () => {
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPoolData = async () => {
    try {
      // You'll need an RPC provider - you can use public Celo RPC
      const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
      
      // Get pool reserves (simplified - in production, use Ubeswap SDK)
      const pairAddress = await getPairAddress(provider, EQT_TOKEN, CELO_TOKEN);
      const reserves = await getReserves(provider, pairAddress);
      
      // Calculate price
      const eqtPrice = reserves[1] / reserves[0]; // CELO per EQT
      const celoPrice = reserves[0] / reserves[1]; // EQT per CELO

      setPoolData({
        eqtPrice,
        celoPrice,
        liquidity: reserves[0] * reserves[1],
        volume24h: 0, // You'd need to query The Graph for this
        reserves: {
          eqt: reserves[0],
          celo: reserves[1]
        }
      });
      
    } catch (err) {
      console.error('Error fetching Ubeswap data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { poolData, loading, error };
};

// Helper function to get pair address (Uniswap V2 style)
const getPairAddress = async (provider, tokenA, tokenB) => {
  // This is a simplified version - use Ubeswap SDK in production
  const factoryABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)'
  ];
  const factory = new ethers.Contract(FACTORY_ADDRESS, factoryABI, provider);
  return await factory.getPair(tokenA, tokenB);
};

// Helper function to get reserves
const getReserves = async (provider, pairAddress) => {
  const pairABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
  ];
  const pair = new ethers.Contract(pairAddress, pairABI, provider);
  const reserves = await pair.getReserves();
  return [parseFloat(ethers.utils.formatEther(reserves.reserve0)), parseFloat(ethers.utils.formatEther(reserves.reserve1))];
};

export default useUbeswapData;
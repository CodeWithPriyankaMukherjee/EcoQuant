import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import CompactMetaMaskButton from './CompactMetaMaskButton';
import TokenDashboard from './TokenDashboard'; // MADARCHOD
//import videoSrc from '../assets/video.mp4'; // Adjust path based on your folder structure
// Mock data for ERC20 tokens
const mockTokens = [
  { name: 'BlueVault Token (BVT)', issued: 1000000, retired: 150000, total: 850000, price: 1.25, change: 2.5, color: '#3B82F6' },
  { name: 'EcoToken (ECO)', issued: 500000, retired: 50000, total: 450000, price: 0.85, change: -1.2, color: '#10B981' },
  { name: 'CarbonCredit (CC)', issued: 2000000, retired: 300000, total: 1700000, price: 2.10, change: 4.0, color: '#F59E0B' },
  { name: 'GreenToken (GT)', issued: 800000, retired: 100000, total: 700000, price: 1.80, change: 1.8, color: '#8B5CF6' },
];

// Mock data for charts
const chartData = [
  { time: '00:00', value: 100 },
  { time: '04:00', value: 105 },
  { time: '08:00', value: 102 },
  { time: '12:00', value: 108 },
  { time: '16:00', value: 115 },
  { time: '20:00', value: 112 },
];



// Ubeswap Pool Component
const UbeswapPoolData = () => {
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with your actual Ubeswap pool address
  const POOL_ADDRESS = "YOUR_UBESWAP_POOL_ADDRESS_HERE";

  useEffect(() => {
    fetchPoolData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      const query = `
        {
          pool(id: "${POOL_ADDRESS.toLowerCase()}") {
            id
            token0 {
              id
              symbol
              name
              decimals
            }
            token1 {
              id
              symbol
              name
              decimals
            }
            token0Price
            token1Price
            totalValueLockedUSD
            volumeUSD
            txCount
            liquidity
            feeTier
          }
        }
      `;

      const response = await fetch('https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (data.pool) {
        setPoolData(data.pool);
        setError(null);
      } else {
        setError('Pool not found');
      }
    } catch (err) {
      console.error('Error fetching pool data:', err);
      setError('Failed to load pool data');
      // Fallback to mock data for demo
      setPoolData({
        token0: { symbol: 'EQT', name: 'EcoQuant Token' },
        token1: { symbol: 'CELO', name: 'Celo' },
        token0Price: '5.53',
        token1Price: '0.18',
        totalValueLockedUSD: '125000',
        volumeUSD: '25000',
        txCount: '150',
        liquidity: '500000',
        feeTier: '3000'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold mb-4">Ubeswap Pool</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded mb-4"></div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !poolData) {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold mb-4">Ubeswap Pool</h3>
        <div className="text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Ubeswap Pool</h3>
        <button 
          onClick={fetchPoolData}
          className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Token Pair */}
      <div className="flex items-center justify-center mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {poolData.token0.symbol?.charAt(0)}
          </div>
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm -ml-2">
            {poolData.token1.symbol?.charAt(0)}
          </div>
        </div>
        <div className="ml-3">
          <div className="font-bold text-lg">
            {poolData.token0.symbol} / {poolData.token1.symbol}
          </div>
          <div className="text-gray-400 text-sm">
            {poolData.feeTier ? `Fee: ${poolData.feeTier / 10000}%` : 'Fee: 0.3%'}
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">1 {poolData.token0.symbol}</div>
          <div className="font-bold text-lg">${parseFloat(poolData.token0Price).toFixed(4)}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-gray-400 text-sm">1 {poolData.token1.symbol}</div>
          <div className="font-bold text-lg">${parseFloat(poolData.token1Price).toFixed(4)}</div>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Value Locked:</span>
          <span className="font-bold text-green-400">
            ${parseFloat(poolData.totalValueLockedUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">24h Volume:</span>
          <span className="font-bold">
            ${parseFloat(poolData.volumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Transactions:</span>
          <span className="font-bold">{parseInt(poolData.txCount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Liquidity:</span>
          <span className="font-bold">
            {parseFloat(poolData.liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 mb-4">
        <button 
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => window.open('https://app.ubeswap.org/#/swap?inputCurrency=CELO&outputCurrency=0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B', '_blank')}
        >
          Trade
        </button>
      </div>

      {/* Pool Health Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Pool Health</span>
          <span className="text-green-400 font-bold">Excellent</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>
    </div>
  );
};

const InvestorDashboard = () => {
  const { login, authenticated } = usePrivy();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/video.mp4" type="video/mp4"
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800/70 backdrop-blur-lg shadow-lg z-20">
        <div className="flex items-center justify-center h-16 bg-white/10 backdrop-blur-lg border-b border-white/20">
          <h1 className="text-xl font-bold text-green-400">EcoQuant</h1>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li className="px-6 py-3 bg-gray-700 cursor-pointer hover:bg-gray-600 transition-colors flex justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
            </li>
            <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors flex justify-center" onClick={() => navigate('/')}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 relative z-30">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Last update: 2 min ago</span>
            {authenticated ? (
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">0x0DF...1AB6</span>
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Welcome Section with MetaMask Button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">EcoQuant Dashboard</h1>
            <p className="text-gray-400">Track your carbon credits and investments in real-time.</p>
          </div>
          <CompactMetaMaskButton />
        </div>

        {/* ERC20 Tokens Cards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Live ERC20 Tokens Updates</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700">USDT</button>
              <button className="px-3 py-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700">Top Gainers</button>
              <button className="px-3 py-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700">7D</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTokens.map((token, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: token.color }}></div>
                  <div className="ml-3">
                    <h3 className="font-bold text-sm">{token.name}</h3>
                    <p className="text-gray-400 text-xs">Price</p>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-2">${token.price}</div>
                <div className={`text-sm ${token.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change > 0 ? '↗' : '↘'} {Math.abs(token.change)}%
                </div>
                <div className="mt-4 space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Issued:</span>
                    <span>{token.issued.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retired:</span>
                    <span>{token.retired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{token.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 h-16 bg-gray-700 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <Area type="monotone" dataKey="value" stroke={token.color} fill={token.color} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Overview + Ubeswap Pool + Token Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Market Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
              <TokenDashboard />
            </div>
          </div>
          
          {/* Ubeswap Pool */}
          <UbeswapPoolData />
        </div>

      </div>
    </div>
  );
};

export default InvestorDashboard;
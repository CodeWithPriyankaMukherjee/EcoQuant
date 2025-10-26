import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { time: '00:00', price: 100 },
  { time: '04:00', price: 105 },
  { time: '08:00', price: 102 },
  { time: '12:00', price: 108 },
  { time: '16:00', price: 115 },
  { time: '20:00', price: 112 },
];

const orderBook = [
  { price: 0.00042, amount: 1.5, total: 0.00063 },
  { price: 0.00041, amount: 2.3, total: 0.00094 },
  { price: 0.00040, amount: 1.8, total: 0.00072 },
  { price: 0.00039, amount: 3.1, total: 0.00121 },
];

const TradingPage = () => {
  const { login, authenticated } = usePrivy();
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg">
        <div className="flex items-center justify-center h-16 bg-gray-700">
          <h1 className="text-xl font-bold text-green-400">EcoQuant</h1>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors">
              <a href="/investor" className="block">🏠 Dashboard</a>
            </li>
            <li className="px-6 py-3 bg-gray-700 cursor-pointer">📊 Trading</li>
            <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors">💼 Portfolio</li>
            <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors">🔄 Transactions</li>
            <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer transition-colors">⚙️ Settings</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search pairs..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Last update: 1 min ago</span>
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

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Chart and Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-6 py-2 rounded-lg ${activeTab === 'buy' ? 'bg-green-500' : 'bg-gray-800'} hover:bg-gray-700 transition-colors`}
                onClick={() => setActiveTab('buy')}
              >
                Buy
              </button>
              <button
                className={`px-6 py-2 rounded-lg ${activeTab === 'sell' ? 'bg-red-500' : 'bg-gray-800'} hover:bg-gray-700 transition-colors`}
                onClick={() => setActiveTab('sell')}
              >
                Sell
              </button>
              <button
                className={`px-6 py-2 rounded-lg ${activeTab === 'swap' ? 'bg-blue-500' : 'bg-gray-800'} hover:bg-gray-700 transition-colors`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
            </div>

            {/* Chart */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">ETH/USDT</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-700 rounded">1H</button>
                  <button className="px-3 py-1 bg-gray-700 rounded">1D</button>
                  <button className="px-3 py-1 bg-gray-700 rounded">1W</button>
                  <button className="px-3 py-1 bg-gray-700 rounded">1M</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Order Form */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">{activeTab === 'buy' ? 'Buy ETH' : activeTab === 'sell' ? 'Sell ETH' : 'Swap'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Amount (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Price (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00042"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button className={`w-full py-2 rounded-lg ${activeTab === 'buy' ? 'bg-green-500 hover:bg-green-600' : activeTab === 'sell' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}>
                  {activeTab === 'buy' ? 'Buy ETH' : activeTab === 'sell' ? 'Sell ETH' : 'Swap'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Order Book and Recent Trades */}
          <div className="space-y-6">
            {/* Order Book */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Order Book</h3>
              <div className="space-y-2 text-sm">
                {orderBook.map((order, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-green-400">{order.price}</span>
                    <span>{order.amount}</span>
                    <span>{order.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-400">0.00042</span>
                  <span>1.5 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">0.00041</span>
                  <span>2.3 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">0.00040</span>
                  <span>1.8 ETH</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Wallet Balance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>USDT</span>
                  <span>1,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span>ETH</span>
                  <span>0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
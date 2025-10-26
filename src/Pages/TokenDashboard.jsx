import React, { useState, useEffect } from 'react';

const TokenDashboard = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [holders, setHolders] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TOKEN_ADDRESS = "0xe00b540dfb16dbe12b80ef89f3172ffe3305ac7b";
  const API_BASE = "https://celo-sepolia.blockscout.com/api";

  useEffect(() => {
    fetchTokenData();
  }, [activeTab]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      switch (activeTab) {
        case 'transactions':
          await fetchTransactions();
          break;
        case 'holders':
          await fetchHolders();
          break;
        case 'contract':
          await fetchTokenInfo();
          break;
        default:
          await fetchTransactions();
      }
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Use the correct API endpoint for token transfers
      const response = await fetch(
        `${API_BASE}?module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&page=1&offset=50&sort=desc`
      );
      
      console.log('Transactions API URL:', `${API_BASE}?module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&page=1&offset=50&sort=desc`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transactions API Response:', data);

      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        setTransactions(data.result);
      } else {
        // If no transactions found, try alternative endpoints
        await tryAlternativeTransactionEndpoints();
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
      await tryAlternativeTransactionEndpoints();
    }
  };

  const tryAlternativeTransactionEndpoints = async () => {
    try {
      // Alternative 1: Try without contract address filter
      const response = await fetch(
        `${API_BASE}?module=account&action=tokentx&address=${TOKEN_ADDRESS}&page=1&offset=50&sort=desc`
      );
      
      const data = await response.json();
      console.log('Alternative transactions response:', data);

      if (data.status === '1' && data.result && Array.isArray(data.result)) {
        // Filter to only show transactions for this token
        const tokenTransactions = data.result.filter(tx => 
          tx.contractAddress?.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
        );
        setTransactions(tokenTransactions);
      } else {
        // Fallback to mock data
        setTransactions(getMockTransactions());
        setError('Using demo data - No transactions found via API');
      }
    } catch (err) {
      console.error('Alternative endpoint failed:', err);
      setTransactions(getMockTransactions());
      setError('Using demo data - API temporarily unavailable');
    }
  };

  const getMockTransactions = () => {
    return [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        method: 'Transfer',
        from: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b3',
        to: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b4',
        value: '1000000000000000000',
        timeStamp: '1705314600'
      },
      {
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        method: 'Transfer',
        from: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b4',
        to: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b5',
        value: '500000000000000000',
        timeStamp: '1705310100'
      }
    ];
  };

  const fetchHolders = async () => {
    try {
      const response = await fetch(
        `${API_BASE}?module=token&action=tokenHolders&contractaddress=${TOKEN_ADDRESS}`
      );
      
      console.log('Holders API URL:', `${API_BASE}?module=token&action=tokenHolders&contractaddress=${TOKEN_ADDRESS}`);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      console.log('Holders response:', data);

      if (data.status === '1' && data.result) {
        const sortedHolders = data.result
          .filter(holder => parseInt(holder.value) > 0)
          .sort((a, b) => parseInt(b.value) - parseInt(a.value));
        setHolders(sortedHolders.slice(0, 100));
      } else {
        setHolders(getMockHolders());
        setError('Using demo holder data - No holders found via API');
      }
    } catch (err) {
      console.error('Fetch holders error:', err);
      setHolders(getMockHolders());
      setError('Using demo holder data - API temporarily unavailable');
    }
  };

  const getMockHolders = () => {
    return [
      { address: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b3', value: '1000000000000000000000' },
      { address: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b4', value: '500000000000000000000' },
      { address: '0x742d35Cc6634C0532925a3b8Df59C5f455d2a4b5', value: '250000000000000000000' }
    ];
  };

  const fetchTokenInfo = async () => {
    try {
      const response = await fetch(
        `${API_BASE}?module=token&action=getToken&contractaddress=${TOKEN_ADDRESS}`
      );
      
      console.log('Token info API URL:', `${API_BASE}?module=token&action=getToken&contractaddress=${TOKEN_ADDRESS}`);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      console.log('Token info response:', data);

      if (data.status === '1' && data.result) {
        setTokenInfo(data.result);
      } else {
        setTokenInfo(getMockTokenInfo());
        setError('Using demo token info - Token info not found via API');
      }
    } catch (err) {
      console.error('Fetch token info error:', err);
      setTokenInfo(getMockTokenInfo());
      setError('Using demo token info - API temporarily unavailable');
    }
  };

  const getMockTokenInfo = () => {
    return {
      name: 'EcoQuant Token',
      symbol: 'EQT',
      decimals: '18',
      totalSupply: '1000000000000000000000000',
      holdersCount: '3',
      transfersCount: '2'
    };
  };

  const formatAddress = (address) => {
    if (!address || address === 'N/A') return 'N/A';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatValue = (value, decimals = 18) => {
    if (!value) return '0';
    const formatted = (parseInt(value) / Math.pow(10, decimals)).toFixed(4);
    return parseFloat(formatted).toString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Handle both Unix timestamp and ISO string
    const date = timestamp.length > 10 ? 
      new Date(timestamp) : 
      new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getMethodName = (tx) => {
    if (tx.method) return tx.method;
    if (tx.input === '0x') return 'Transfer';
    if (tx.input && tx.input.startsWith('0xa9059cbb')) return 'Transfer';
    if (tx.input && tx.input.startsWith('0x23b872dd')) return 'Transfer From';
    return 'Transfer'; // Default to Transfer for token transactions
  };

  const getTxHash = (tx) => {
    return tx.hash || tx.tx_hash || tx.transactionHash || 'N/A';
  };

  const getFromAddress = (tx) => {
    return tx.from?.hash || tx.from || tx.from_address || 'N/A';
  };

  const getToAddress = (tx) => {
    return tx.to?.hash || tx.to || tx.to_address || 'N/A';
  };

  const getTxValue = (tx) => {
    return tx.value || tx.amount || '0';
  };

  if (loading && !transactions.length && !holders.length && !tokenInfo) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex -mb-px">
          {['transactions', 'holders', 'contract'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Token Transfers</h3>
              <button 
                onClick={fetchTokenData}
                disabled={loading}
                className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Txn Hash</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-right">Value (EQT)</th>
                    <th className="px-4 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => {
                    const txHash = getTxHash(tx);
                    const fromAddress = getFromAddress(tx);
                    const toAddress = getToAddress(tx);
                    const txValue = getTxValue(tx);
                    
                    return (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          {txHash !== 'N/A' ? (
                            <a
                              href={`https://celo-sepolia.blockscout.com/tx/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                            >
                              {formatAddress(txHash)}
                            </a>
                          ) : (
                            <span className="text-gray-500 font-mono text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-600 px-2 py-1 rounded text-xs">
                            {getMethodName(tx)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {fromAddress !== 'N/A' ? (
                            <a
                              href={`https://celo-sepolia.blockscout.com/address/${fromAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {formatAddress(fromAddress)}
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {toAddress !== 'N/A' ? (
                            <a
                              href={`https://celo-sepolia.blockscout.com/address/${toAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {formatAddress(toAddress)}
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatValue(txValue)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatTimestamp(tx.timeStamp || tx.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {transactions.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400">
                No transactions found
              </div>
            )}
          </div>
        )}

        {/* Holders Tab */}
        {activeTab === 'holders' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Token Holders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-right">Balance (EQT)</th>
                    <th className="px-4 py-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <a
                          href={`https://celo-sepolia.blockscout.com/address/${holder.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {formatAddress(holder.address)}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatValue(holder.value)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {tokenInfo ? 
                          ((parseInt(holder.value) / parseInt(tokenInfo.totalSupply)) * 100).toFixed(4) + '%'
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {holders.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400">
                No holders found
              </div>
            )}
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Token Information</h3>
            {tokenInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Token Name</label>
                    <div className="font-bold">{tokenInfo.name}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Symbol</label>
                    <div className="font-bold">{tokenInfo.symbol}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Decimals</label>
                    <div className="font-bold">{tokenInfo.decimals}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Total Supply</label>
                    <div className="font-bold font-mono">
                      {formatValue(tokenInfo.totalSupply)} EQT
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Contract Address</label>
                    <div className="font-mono text-sm break-all">
                      <a
                        href={`https://celo-sepolia.blockscout.com/address/${TOKEN_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {TOKEN_ADDRESS}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Holders</label>
                    <div className="font-bold">{tokenInfo.holdersCount || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Transfers</label>
                    <div className="font-bold">{tokenInfo.transfersCount || 'N/A'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No token information available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenDashboard;
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    // Replace Polygon Mumbai with Celo Sepolia
    celoSepolia: {
      url: "https://rpc.ankr.com/celo_sepolia",
      accounts: process.env.CELO_PRIVATE_KEY ? [process.env.CELO_PRIVATE_KEY] : [],
      chainId: 11142220,
    },
    // Keep localhost for testing
    localhost: {
      url: "http://127.0.0.1:8545",
    }
  },
  // Update etherscan if needed (Celo uses Blockscout)
  etherscan: {
    apiKey: {
      celoSepolia: "your-blockscout-api-key" // Optional
    },
    customChains: [
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://celo-sepolia.blockscout.com/api",
          browserURL: "https://celo-sepolia.blockscout.com"
        }
      }
    ]
  }
};
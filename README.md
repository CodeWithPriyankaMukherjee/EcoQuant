EQT Deployed to Celo Sepolia contract address (ERC 20 Token) 0xe00b540dfb16dbe12b80ef89f3172ffe3305ac7b

https://celo-sepolia.blockscout.com/token/0xe00b540dfb16dbe12b80ef89f3172ffe3305ac7b


# 🌱 EcoQuant – A Blockchain-Powered Carbon Finance Ecosystem
## Revolutionizing Carbon Credits through Transparent Tokenization & AI-Driven Verification

![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-blue)
![IPFS](https://img.shields.io/badge/IPFS-Storage-orange)

## Quick Start

### Prerequisites

- **Node.js:** Version 18.x or higher
- **npm:** Version 9.x or higher  
- **Git:** For cloning the repository

```bash
# Verify your environment
node --version    # Should be 18.x or higher
npm --version     # Should be 9.x ++
git --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/theskepticgeek/EcoQuant.git
cd EcoQuant
```
### 2. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install Privy authentication (if not already included)
npm install @privy-io/react-auth@latest

# Install Hardhat globally (if needed)
npm install -g hardhat
```
### 3. Hardhat Setup & Smart Contract Configuration

#### Since this project uses Hardhat for smart contract interactions and backend processing, you need to set it up in the main directory:
```bash
# Initialize Hardhat (if not already present)
npx hardhat init

# Compile smart contracts
npx hardhat compile

# Run tests to verify everything works
npx hardhat test

```

    Note: Hardhat must be properly set up in the main directory as the backend depends on the compiled contracts and ABI files for NFT minting functionality.
### 4. Environment Configuration
#### Create a ```.env``` file in the root directory with your own API Keys:
```bash
# Privy Authentication
VITE_PRIVY_APP_ID=

# Pinata IPFS Configuration
VITE_PINATA_API_KEY=
VITE_PINATA_SECRET_API_KEY=
VITE_PINATA_JWT=

# Blockchain Configuration
PRIVATE_KEY=
ALCHEMY_API_KEY=
POLYGON_AMOY_RPC_URL=

# Test Configuration
RECIPIENT=
AMOUNT=
IPFS_HASH=
```

## Running the Application
### You need to run two servers simultaneously:
### Terminal 1 - Frontend (Root Directory)
```bash
# From the main project directory
npm run dev
```
### Terminal 2 - Backend Server
```bash
# Navigate to backend directory
cd backend

# Start the backend server
node server.cjs
```
#### Backend API will be available at: ```http://localhost:3001```

## Troubleshooting
### Common Issues:
#### 1. Hardhat Compilation Error:
```bash
# Clear cache and recompile
npx hardhat clean
npx hardhat compile
```
#### 2. Dependency Issues:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm install @privy-io/react-auth@latest
```
#### 3. Port Conflicts
##### Step 1: Kill all ports
```bash
# Kill processes on commonly used ports
npx kill-port 5173  # Vite frontend
npx kill-port 3001  # Backend API
npx kill-port 8545  # Hardhat node
npx kill-port 3000  # Alternative frontend port
```
##### Step 2: After killing ports, restart the servers:
###### Terminal 1:
```bash
# Terminal 1 - Restart frontend
npm run dev
```
###### Terminal 2:
```bash
# Terminal 2 - Restart backend
cd backend
node server.cjs
```
##### Step 3: Change Vite Port Configuration:
###### Option 1: Command line flag
```bash
npm run dev -- --port 3000
```
###### Option 2: Update vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Change to port 3000
    host: true   // Optional: allows external access
  }
})
```

## Verification Checklist
##### All dependencies installed (npm install completed without errors)

##### Hardhat compiled successfully (npx hardhat compile)

##### Environment variables set in .env file

##### Frontend server running (check terminal for actual port)

##### Backend server running (check terminal for actual port)

##### MetaMask connected to Polygon Amoy testnet

##### Test MATIC available in wallet

##### No port conflicts between frontend and backend


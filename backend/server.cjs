const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Use relative path instead of absolute path
// On Render, your backend is deployed from the 'backend' directory
const PROJECT_ROOT = path.join(__dirname, '..'); // Go up one level to project root

// Test endpoint to check file structure
app.get('/api/debug', (req, res) => {
  try {
    const files = fs.readdirSync(PROJECT_ROOT);
    const backendFiles = fs.readdirSync(__dirname);
    res.json({
      projectRoot: PROJECT_ROOT,
      projectFiles: files,
      backendFiles: backendFiles,
      dirname: __dirname,
      hasHardhatConfig: fs.existsSync(path.join(PROJECT_ROOT, 'hardhat.config.js')),
      hasScripts: fs.existsSync(path.join(PROJECT_ROOT, 'scripts'))
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Mint endpoint
app.post('/api/mint', async (req, res) => {
  try {
    const { recipient, amount, ipfsHash } = req.body;
    
    if (!recipient || !amount || !ipfsHash) {
      return res.status(400).json({ 
        error: 'Missing required parameters: recipient, amount, or ipfsHash' 
      });
    }

    console.log('Minting request:', { recipient, amount, ipfsHash });

    // Use environment variables for sensitive data
    const envVars = {
      RECIPIENT: recipient,
      AMOUNT: amount,
      IPFS_HASH: ipfsHash,
      PRIVATE_KEY: process.env.PRIVATE_KEY,
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      POLYGON_AMOY_RPC_URL: process.env.POLYGON_AMOY_RPC_URL
    };

    // Set environment variables for the command
    const envString = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const command = `cd "${PROJECT_ROOT}" && ${envString} npx hardhat run scripts/mint.cjs --network celoSepolia`;
    
    console.log('Executing command in directory:', PROJECT_ROOT);
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: PROJECT_ROOT,
      timeout: 60000 // 60 second timeout
    });

    console.log('Mint script stdout:', stdout);
    if (stderr) console.log('Mint script stderr:', stderr);
    
    // Check for successful output
    if (stdout.includes('Transaction hash:') || stdout.includes('SUCCESS:')) {
      let txHash;
      if (stdout.includes('Transaction hash:')) {
        txHash = stdout.match(/Transaction hash: (0x[a-fA-F0-9]{64})/)[1];
      } else {
        txHash = stdout.split('SUCCESS:')[1].trim();
      }
      
      res.json({ 
        success: true, 
        transactionHash: txHash,
        message: 'BVT tokens minted successfully' 
      });
    } else {
      console.error('Minting failed - stdout:', stdout);
      console.error('Minting failed - stderr:', stderr);
      res.status(500).json({ 
        success: false,
        error: 'Minting failed: ' + (stderr || stdout || 'Unknown error')
      });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    port: PORT,
    nodeEnv: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'BlueVault Backend API',
    endpoints: {
      health: '/api/health',
      mint: '/api/mint (POST)',
      debug: '/api/debug'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
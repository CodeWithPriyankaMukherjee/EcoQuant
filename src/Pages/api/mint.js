app.post('/api/mint', async (req, res) => {
  try {
    const {  amount, ipfsHash } = req.body;

    if (!recipient || !amount || !ipfsHash) {
      return res.status(400).json({ 
        error: 'Missing required parameters: recipient, amount, or ipfsHash' 
      });
    }

    console.log('Minting request:', { recipient, amount, ipfsHash });

    // ✅ Use Celo Sepolia contract address
    const recipient = "0xAfc03DDCF432880bC1b4A5eF7519f2afC6F2c083";
    const contractAddress = "0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B"; //ISKI MAA KA BHOSDA

    // ✅ Use Celo Sepolia network, not localhost
    const command = `RECIPIENT=${recipient} AMOUNT=${amount} IPFS_HASH=${ipfsHash} npx hardhat run scripts/mint.cjs --network celoSepolia`;
    const { stdout, stderr } = await execAsync(command);

    console.log('Mint script output:', stdout);

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
        message: 'EQT tokens minted successfully' 
      });
    } else {
      console.error('Minting failed:', stderr);
      res.status(500).json({ 
        success: false,
        error: 'Minting failed: ' + (stderr || stdout)
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
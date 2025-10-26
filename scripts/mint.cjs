const { ethers } = require("hardhat");

async function main() {
  try {
    // Use environment variables
    const recipient = process.env.RECIPIENT;
    const amount = process.env.AMOUNT;
    const ipfsHash = process.env.IPFS_HASH;
    
    console.log('Environment variables:', { recipient, amount, ipfsHash });
    
    if (!recipient || !amount || !ipfsHash) {
      throw new Error('Missing RECIPIENT, AMOUNT, or IPFS_HASH environment variables');
    }

    // EQT contract address on Celo Sepolia
    const contractAddress = "0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B";
    
    console.log(`Using contract address: ${contractAddress}`);

    const Token = await ethers.getContractFactory("EcoQuantToken");
    const token = await Token.attach(contractAddress);
    
    const [owner] = await ethers.getSigners();
    console.log(`Using owner account: ${owner.address}`);
    
    // Test the connection first
    try {
      const name = await token.name();
      const symbol = await token.symbol();
      console.log(`Connected to contract: ${name} (${symbol})`);
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      throw new Error('Contract not found or inaccessible at address: ' + contractAddress);
    }
    
    const tokenWithOwner = token.connect(owner);
    
    // FIX: Update the log message from BVT to EQT
    console.log(`Minting ${amount} EQT to ${recipient} with IPFS: ${ipfsHash}`);
    
    const tx = await tokenWithOwner.mint(
      recipient, 
      ethers.parseUnits(amount, 18), // Assuming 18 decimals like standard ERC20
      ipfsHash
    );
    
    console.log("Transaction submitted, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Transaction hash:", tx.hash);
    console.log("SUCCESS:" + tx.hash);
    
    // Verify the mint worked
    try {
      const recipientBalance = await token.balanceOf(recipient);
      console.log(`Recipient balance: ${ethers.formatUnits(recipientBalance, 18)} EQT`);
      
      // Also get the mint record ID
      const totalRecords = await token.getTotalMintRecords();
      const lastRecordId = totalRecords - 1;
      console.log(`Mint record ID: ${lastRecordId}`);
      
    } catch (balanceError) {
      console.warn('Could not check balance:', balanceError);
    }
    
  } catch (error) {
    console.error("ERROR:" + error.message);
    process.exit(1);
  }
}

main().catch(console.error);
// scripts/fundTrading.cjs
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Funding contract with account:", deployer.address);
  
  // CORRECT token addresses (use lowercase to avoid checksum issues)
  const TRADING_CONTRACT = "0x53E53A9EA1d68248418c70101cAE6a078373995b";
  const EQT_TOKEN_ADDRESS = "0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B";
  const CELO_TOKEN_ADDRESS = "0x1c16a6c9c5f4008eda4d133c62b46ffc6305de5c"; // ALL LOWERCASE
  
  console.log("Using addresses:");
  console.log("- Trading:", TRADING_CONTRACT);
  console.log("- EQT:", EQT_TOKEN_ADDRESS);
  console.log("- CELO:", CELO_TOKEN_ADDRESS);
  
  try {
    // Get contracts
    const trading = await ethers.getContractAt("EQTTrading", TRADING_CONTRACT);
    const eqtToken = await ethers.getContractAt("IERC20", EQT_TOKEN_ADDRESS);
    const celoToken = await ethers.getContractAt("IERC20", CELO_TOKEN_ADDRESS);
    
    console.log("\n✅ Token contracts loaded successfully");
    
    // Check balances
    console.log("\n💰 Checking balances...");
    const celoBalance = await celoToken.balanceOf(deployer.address);
    const eqtBalance = await eqtToken.balanceOf(deployer.address);
    
    console.log("Your balances:");
    console.log("- CELO:", ethers.formatEther(celoBalance));
    console.log("- EQT:", ethers.formatEther(eqtBalance));
    
    // Adjust amounts based on actual balance
    const celoAmount = celoBalance > ethers.parseEther("0.1") ? ethers.parseEther("0.1") : celoBalance / 2n;
    const eqtAmount = eqtBalance > ethers.parseEther("0.553") ? ethers.parseEther("0.553") : eqtBalance / 2n;
    
    if (celoAmount === 0n || eqtAmount === 0n) {
      console.log("\n❌ Insufficient balance to fund contract");
      console.log("You need both CELO and EQT tokens to add liquidity");
      console.log("Get CELO from: https://faucet.celo.org/alfajores");
      return;
    }
    
    console.log("\n📦 Funding amounts:");
    console.log("- CELO:", ethers.formatEther(celoAmount));
    console.log("- EQT:", ethers.formatEther(eqtAmount));
    
    // Approve the trading contract to spend tokens
    console.log("\n🔏 Approving tokens...");
    const approveCelo = await celoToken.approve(TRADING_CONTRACT, celoAmount);
    await approveCelo.wait();
    console.log("✅ CELO approved");
    
    const approveEqt = await eqtToken.approve(TRADING_CONTRACT, eqtAmount);
    await approveEqt.wait();
    console.log("✅ EQT approved");
    
    // Add liquidity
    console.log("\n🔄 Adding liquidity...");
    const tx = await trading.addLiquidity(celoAmount, eqtAmount);
    const receipt = await tx.wait();
    console.log("✅ Liquidity added successfully!");
    console.log("Transaction hash:", receipt.hash);
    
    // Check new contract balances
    const contractBalances = await trading.getBalances();
    console.log("\n📊 Contract balances after funding:");
    console.log("- CELO:", ethers.formatEther(contractBalances[0]));
    console.log("- EQT:", ethers.formatEther(contractBalances[1]));
    
  } catch (error) {
    console.log("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
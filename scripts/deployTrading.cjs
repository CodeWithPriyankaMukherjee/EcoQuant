// scripts/deployTrading.cjs
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // YOUR ACTUAL ADDRESSES:
  const EQT_TOKEN_ADDRESS = "0xE00B540Dfb16DbE12B80EF89f3172Ffe3305ac7B"; // Your EQT on Sepolia
  const CELO_TOKEN_ADDRESS = "0x1C16A6C9c5F4008EdA4d133C62B46ffc6305dE5c"; // CELO on Sepolia
  
  console.log("Using EQT Token:", EQT_TOKEN_ADDRESS);
  console.log("Using CELO Token:", CELO_TOKEN_ADDRESS);
  
  console.log("Deploying EQTTrading contract...");
  
  const EQTTrading = await ethers.getContractFactory("EQTTrading");
  const trading = await EQTTrading.deploy(EQT_TOKEN_ADDRESS, CELO_TOKEN_ADDRESS);
  
  await trading.deployed();
  
  console.log("✅ EQTTrading deployed to:", trading.address);
  
  // Wait for block confirmations
  console.log("Waiting for 5 block confirmations...");
  await trading.deployTransaction.wait(5);
  
  console.log("🎉 Deployment completed!");
  console.log("\n📝 Next steps:");
  console.log("1. Fund the trading contract with EQT and CELO");
  console.log("2. Update your frontend with contract address:", trading.address);
  console.log("3. Test with small amounts first!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const { ethers } = require("hardhat");
const { artifacts } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  const provider = ethers.provider;
  const balance = await provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "");

  // Deploy the EQT contract with 2 parameters
  console.log("Deploying EcoQuantToken...");
  const EcoQuantToken = await ethers.getContractFactory("EcoQuantToken");
  const token = await EcoQuantToken.deploy(
    "EcoQuant Token",  // name
    "EQT"               // symbol
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("EcoQuantToken deployed to:", tokenAddress);
  console.log("Contract owner:", deployer.address);
  
  // Save the contract address to src/contracts (since your React app is in src)
  const contractsDir = path.join(__dirname, '..', 'src', 'contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, 'contract-address.json'),
    JSON.stringify({ 
      EcoQuantToken: tokenAddress,
      network: "polygon-amoy",
      deployer: deployer.address
    }, undefined, 2)
  );

  // Also save to config for easy access by scripts
  const configDir = path.join(__dirname, '..', 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(configDir, 'deployment-config.json'),
    JSON.stringify({ 
      EcoQuantToken: tokenAddress,
      network: "polygon-amoy",
      deployer: deployer.address,
      deployedAt: new Date().toISOString()
    }, undefined, 2)
  );

  // Get the contract ABI
  const artifact = await artifacts.readArtifact("EcoQuantToken");

  fs.writeFileSync(
    path.join(contractsDir, 'EcoQuantToken.json'),
    JSON.stringify(artifact, null, 2)
  );

  console.log("Contract artifacts saved to:", contractsDir);
  
  // Verify contract on Polygonscan
  console.log("\nTo verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network polygon_amoy ${tokenAddress} "EcoQuant Token" "EQT"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
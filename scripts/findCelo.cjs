// scripts/findCorrectCelo.cjs
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Searching for CELO token on Sepolia...");
  console.log("Your address:", deployer.address);
  
  // Known CELO token addresses across networks
  const testAddresses = [
    // Try some known addresses
    "0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9", // Alfajores
    "0x874069fa1eb16d44d622f2e0ca25eea172369bc1", // Another possible Sepolia
    "0x765de816845861e75a25fca122bb6898b8b1282a", // cUSD on Mainnet
    "0x1c16a6c9c5f4008eda4d133c62b46ffc6305de5c", // Your current (might be wrong)
  ];
  
  for (const address of testAddresses) {
    try {
      console.log(`\n🔍 Testing: ${address}`);
      const code = await deployer.provider.getCode(address);
      
      if (code === '0x') {
        console.log("   ❌ No contract code");
        continue;
      }
      
      console.log("   ✅ Contract exists");
      
      // Try to call balanceOf
      try {
        const token = new ethers.Contract(address, [
          "function balanceOf(address) view returns (uint256)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)"
        ], deployer);
        
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const balance = await token.balanceOf(deployer.address);
        
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Your balance: ${ethers.formatUnits(balance, decimals)}`);
        
        if (symbol === 'CELO' || symbol === 'cCELO') {
          console.log(`🎯 FOUND CELO TOKEN: ${address}`);
          return address;
        }
      } catch (e) {
        console.log("   Not a standard ERC20 token");
      }
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log("\n❌ No standard CELO ERC20 token found.");
  console.log("Let's use native CELO instead.");
  return null;
}

main()
  .then((address) => {
    if (address) {
      console.log(`\n✅ Use this CELO address: ${address}`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
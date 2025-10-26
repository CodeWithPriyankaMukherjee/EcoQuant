// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;  // Updated to 0.8.19 for better compatibility

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EQTTrading is ReentrancyGuard, Ownable {
    IERC20 public eqtToken;
    IERC20 public celoToken;
    
    // Trading parameters
    uint256 public tradingFee = 25; // 0.25% in basis points
    uint256 public ownerFee = 10; // 0.10% to owner
    uint256 public projectFee = 15; // 0.15% to projects
    
    // Based on your liquidity pool: 1 CELO = ~5.53 EQT
    uint256 public constant EQT_PER_CELO = 5530000000000000000; // 5.53 * 10^18 (with decimals)
    uint256 public constant CELO_PER_EQT = 180000000000000000; // ~0.18 * 10^18
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 celoAmount, uint256 eqtAmount, uint256 fee);
    event TokensSold(address indexed seller, uint256 eqtAmount, uint256 celoAmount, uint256 fee);
    event FeesDistributed(uint256 ownerAmount, uint256 projectAmount);
    
    constructor(address _eqtToken, address _celoToken, address _initialOwner) Ownable(_initialOwner) {
        require(_eqtToken != address(0), "EQT token address cannot be zero");
        require(_celoToken != address(0), "CELO token address cannot be zero");
        require(_initialOwner != address(0), "Owner address cannot be zero");
        
        eqtToken = IERC20(_eqtToken);
        celoToken = IERC20(_celoToken);
    }
    
    // Buy EQT with CELO
    function buyEQT(uint256 celoAmount, uint256 minEQTAmount) external nonReentrant returns (uint256) {
        require(celoAmount > 0, "Amount must be greater than 0");
        
        // Transfer CELO from user
        require(celoToken.transferFrom(msg.sender, address(this), celoAmount), "CELO transfer failed");
        
        // Calculate fees
        uint256 totalFee = (celoAmount * tradingFee) / 10000;
        uint256 ownerFeeAmount = (celoAmount * ownerFee) / 10000;
        uint256 projectFeeAmount = (celoAmount * projectFee) / 10000;
        uint256 amountAfterFees = celoAmount - totalFee;
        
        // Calculate EQT amount based on your pool price
        uint256 eqtAmount = (amountAfterFees * EQT_PER_CELO) / 1e18;
        require(eqtAmount >= minEQTAmount, "Slippage too high");
        
        // Check contract has enough EQT
        require(eqtToken.balanceOf(address(this)) >= eqtAmount, "Insufficient EQT liquidity");
        
        // Transfer EQT to user
        require(eqtToken.transfer(msg.sender, eqtAmount), "EQT transfer failed");
        
        // Distribute fees
        distributeFees(ownerFeeAmount, projectFeeAmount);
        
        emit TokensPurchased(msg.sender, celoAmount, eqtAmount, totalFee);
        return eqtAmount;
    }
    
    // Sell EQT for CELO
    function sellEQT(uint256 eqtAmount, uint256 minCeloAmount) external nonReentrant returns (uint256) {
        require(eqtAmount > 0, "Amount must be greater than 0");
        
        // Transfer EQT from user
        require(eqtToken.transferFrom(msg.sender, address(this), eqtAmount), "EQT transfer failed");
        
        // Calculate CELO amount based on your pool price
        uint256 celoAmountBeforeFees = (eqtAmount * CELO_PER_EQT) / 1e18;
        
        // Calculate fees
        uint256 totalFee = (celoAmountBeforeFees * tradingFee) / 10000;
        uint256 ownerFeeAmount = (celoAmountBeforeFees * ownerFee) / 10000;
        uint256 projectFeeAmount = (celoAmountBeforeFees * projectFee) / 10000;
        uint256 celoAmountAfterFees = celoAmountBeforeFees - totalFee;
        
        require(celoAmountAfterFees >= minCeloAmount, "Slippage too high");
        
        // Check contract has enough CELO
        require(celoToken.balanceOf(address(this)) >= celoAmountAfterFees, "Insufficient CELO liquidity");
        
        // Transfer CELO to user
        require(celoToken.transfer(msg.sender, celoAmountAfterFees), "CELO transfer failed");
        
        // Distribute fees
        distributeFees(ownerFeeAmount, projectFeeAmount);
        
        emit TokensSold(msg.sender, eqtAmount, celoAmountAfterFees, totalFee);
        return celoAmountAfterFees;
    }
    
    // Get quote for buying EQT
    function getBuyQuote(uint256 celoAmount) external view returns (uint256) {
        uint256 totalFee = (celoAmount * tradingFee) / 10000;
        uint256 amountAfterFees = celoAmount - totalFee;
        return (amountAfterFees * EQT_PER_CELO) / 1e18;
    }
    
    // Get quote for selling EQT
    function getSellQuote(uint256 eqtAmount) external view returns (uint256) {
        uint256 celoAmountBeforeFees = (eqtAmount * CELO_PER_EQT) / 1e18;
        uint256 totalFee = (celoAmountBeforeFees * tradingFee) / 10000;
        return celoAmountBeforeFees - totalFee;
    }
    
    function distributeFees(uint256 ownerFeeAmount, uint256 projectFeeAmount) internal {
        // Transfer fees to owner
        if (ownerFeeAmount > 0) {
            celoToken.transfer(owner(), ownerFeeAmount);
        }
        // For now, send project fees to owner (replace with your distribution logic)
        if (projectFeeAmount > 0) {
            celoToken.transfer(owner(), projectFeeAmount);
        }
        
        emit FeesDistributed(ownerFeeAmount, projectFeeAmount);
    }
    
    // Admin function to add liquidity to the contract
    function addLiquidity(uint256 celoAmount, uint256 eqtAmount) external onlyOwner {
        require(celoToken.transferFrom(msg.sender, address(this), celoAmount), "CELO transfer failed");
        require(eqtToken.transferFrom(msg.sender, address(this), eqtAmount), "EQT transfer failed");
    }
    
    // Admin functions
    function setFees(uint256 _tradingFee, uint256 _ownerFee, uint256 _projectFee) external onlyOwner {
        require(_tradingFee <= 100, "Fee too high"); // Max 1%
        require(_ownerFee + _projectFee == _tradingFee, "Fee distribution must match total");
        
        tradingFee = _tradingFee;
        ownerFee = _ownerFee;
        projectFee = _projectFee;
    }
    
    // Withdraw any accidentally sent tokens
    function withdrawToken(IERC20 token, uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Token transfer failed");
    }
    
    // Get contract balances
    function getBalances() external view returns (uint256 celoBalance, uint256 eqtBalance) {
        return (celoToken.balanceOf(address(this)), eqtToken.balanceOf(address(this)));
    }
}
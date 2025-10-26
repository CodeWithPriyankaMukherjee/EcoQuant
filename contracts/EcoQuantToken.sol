// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoQuantToken is ERC20, Ownable {
    // Struct to store minting details
    struct MintRecord {
        address recipient;
        uint256 amount;
        string ipfsHash;
        uint256 timestamp;
    }
    
    // Mapping to store mint records
    mapping(uint256 => MintRecord) public mintRecords;
    uint256 public mintCount;
    
    event TokensMinted(
        address indexed recipient,
        uint256 amount,
        string ipfsHash,
        uint256 recordId,
        uint256 timestamp
    );

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        mintCount = 0;
    }

    function mint(
        address to, 
        uint256 amount, 
        string memory ipfsHash
    ) public onlyOwner returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        _mint(to, amount);
        
        uint256 currentMintId = mintCount;
        mintRecords[currentMintId] = MintRecord({
            recipient: to,
            amount: amount,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });
        
        mintCount++;
        
        emit TokensMinted(
            to, 
            amount, 
            ipfsHash, 
            currentMintId, 
            block.timestamp
        );
        
        return currentMintId;
    }

    function getMintRecord(uint256 recordId) public view returns (
        address recipient,
        uint256 amount,
        string memory ipfsHash,
        uint256 timestamp
    ) {
        require(recordId < mintCount, "Record does not exist");
        MintRecord memory record = mintRecords[recordId];
        return (
            record.recipient,
            record.amount,
            record.ipfsHash,
            record.timestamp
        );
    }

    function getTotalMintRecords() public view returns (uint256) {
        return mintCount;
    }
}
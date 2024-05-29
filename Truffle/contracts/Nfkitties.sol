// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../iMP/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../iMP/@openzeppelin/contracts/utils/Counters.sol";
import "../iMP/@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Nfkitties is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private supply;
    address contractAddress;

    uint256 public maxSupply = 25; 


    constructor(address marketplaceAddress) ERC721("NFKitties", "NFK") {
        contractAddress = marketplaceAddress;
    }

    
  modifier mintCompliance() {
    require(supply.current() < maxSupply, "Max supply exceeded!");
    _;
  }

    function mintToken(string memory tokenURI) public mintCompliance() returns (uint) {
        _tokenIds.increment();
        supply.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}
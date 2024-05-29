// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../iMP/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../iMP/@openzeppelin/contracts/utils/Counters.sol";
import "../iMP/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    
     address public owner;
     address public royalty;
    
     constructor() {
     
         owner = msg.sender;
         royalty = 0x6Bf8Cf0311FF1fD3c941C88315Bb339CD40dA92A;
     }
     

     struct MarketItem {
         uint itemId;
         address nftContract;
         uint256 tokenId;
         address payable seller;
         address payable owner;
         address payable royalty;
         uint256 price;
         bool sold;
     }
     
     mapping(uint256 => MarketItem) private idToMarketItem;
     
     event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        address royalty,
        uint256 price,
        bool sold
     );

     event NftTransfered(
          address indexed nftContract,
          uint256 indexed tokenId,
          address sender,
          address reciever
     );
     
     event MarketItemSold (
         uint indexed itemId,
         address owner
         );

     event MarketItemDelisted (
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner
     );     
     
      function transferAnNft(
        address nftContract,
        uint256 tokenId,
        address recieverAddress
       ) public virtual {
         bytes memory _data;
            
        IERC721(nftContract).safeTransferFrom(msg.sender, address(recieverAddress), tokenId, _data);

        emit NftTransfered(
                nftContract,
                tokenId,
                msg.sender,
                address(recieverAddress)
            );
    }
    
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
        ) public payable nonReentrant {
            require(price > 0, "Price must be greater than 0");
            
            _itemIds.increment();
            uint256 itemId = _itemIds.current();
  
            idToMarketItem[itemId] =  MarketItem(
                itemId,
                nftContract,
                tokenId,
                payable(msg.sender),
                payable(address(0)),
                payable(royalty),
                price,
                false
            );
            
            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
                
            emit MarketItemCreated(
                itemId,
                nftContract,
                tokenId,
                msg.sender,
                address(0),
                address(royalty),
                price,
                false
            );
        }

   function delistMarketItem(address nftContract, uint256 tokenId, uint256 itemId) public nonReentrant {
            uint InnertokenId = idToMarketItem[itemId].tokenId;
            address InnernftContract = idToMarketItem[itemId].nftContract;
            address originalOwner =  idToMarketItem[itemId].seller;
            bool sold = idToMarketItem[itemId].sold;
            require(msg.sender == originalOwner, "This can only be called by the person who listed the item");
            require(nftContract == InnernftContract && tokenId == InnertokenId, "you supplied a wrong or non existent token param");
            require(sold != true, "This item was prevously sold");
    
            IERC721(nftContract).transferFrom(address(this), address(originalOwner), tokenId);
          
        delete idToMarketItem[tokenId]; //Delete from mapping
                
        emit MarketItemDelisted(
        nftContract,
        tokenId,
        address(originalOwner) 
        ); // Emitting event

    }   
        
    function createMarketSale(
        address nftContract,
        uint256 itemId
        ) public payable nonReentrant {
            uint price = idToMarketItem[itemId].price;
            uint tokenId = idToMarketItem[itemId].tokenId;
            bool sold = idToMarketItem[itemId].sold;
            
            require(msg.value == price, "Please submit the asking price in order to complete the purchase");
            require(sold != true, "This Sale has alredy finnished");
            emit MarketItemSold(
                itemId,
                msg.sender
                );
    
            uint256 x = msg.value - msg.value/20;
            idToMarketItem[itemId].royalty.transfer(msg.value/20); //adjust the denominator to change the amount of dividends sent to the royalty address 
            idToMarketItem[itemId].seller.transfer(x); //adjust the denominator to change the amount of dividends sent to the seller address 
            IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
            idToMarketItem[itemId].owner = payable(msg.sender);
            _itemsSold.increment();
            idToMarketItem[itemId].sold = true;
        }


    
}
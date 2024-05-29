const NftMarket = artifacts.require("./NftMarket");
const NFT = artifacts.require("./NFT");
const fs = require('fs');
const hre = require("truffle");


module.exports = async function(deployer, network, accounts) {

  
 

  deployer.deploy(NftMarket).then(function() {
    return deployer.deploy(NFT, NftMarket.address);

    
  }).then(  () => { writeToFile(NFT.address, NftMarket.address) } );
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

async function writeToFile(NFTadd, NftMarketadd) {


 let config = `
 export const NftMarket = "${NftMarketadd}"
 export const NFT = "${NFTadd}"
 `
  let data = JSON.stringify(config)
   fs.writeFileSync('config.js', JSON.parse(data))
   
}



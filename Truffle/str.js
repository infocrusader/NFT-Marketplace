const fs = require('fs');
const contract = JSON.parse(fs.readFileSync('./build/contracts/NftMarket.json', 'utf8'));
const nftcontract = JSON.parse(fs.readFileSync('./build/contracts/NFT.json', 'utf8'));
//console.log(JSON.stringify(contract.abi));


let abi =  `export const MarketAbi = ${JSON.stringify(contract.abi)}
export const NFTAbi = ${JSON.stringify(nftcontract.abi)}`
  
  let data = JSON.stringify(abi)
  fs.writeFileSync('abi.js', JSON.parse(data))
 
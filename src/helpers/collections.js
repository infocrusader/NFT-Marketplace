export const NfTmCollections = {
  
  "0x13881": [
      {
        image:
          "https://ipfs.moralis.io:2053/ipfs/QmVE7hShxoAAjUKPy6JsZJSRsGvJLWhai6KdFhog9yZEsu",
        name: "NFKitties",
        addrs: "0xc9D23287eD96Cb1a57b681743E2D6185CF4cb572",
      },
  
 ]

};


export const getCollectionsByAddress = (chain) => NfTmCollections[chain];

import { useMainDapp } from "providers/MainDapp/MainDapp";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useCollections = (addrs) => {
  const { token } = useMoralisWeb3Api();
  const { chainId } = useMainDapp();
  const { resolveLink } = useIPFS();
  const [CollectionNFTs, setCollectionNFTs] = useState([]);
  const {
    fetch: getCollections,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(token.getAllTokenIds, { chain: chainId, address: addrs });
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(async () => {
    if (data?.result) {
      const NFTs = data.result;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          // metadata is a string type
          NFT.image = resolveLink(NFT.metadata?.image);
          NFT.name = NFT.metadata.name; 
          NFT.description = NFT.metadata.description; 
        }else if (NFT?.token_uri){
          try {
            await fetch(NFT.token_uri)
              .then((response) => response.json())
              .then((data) => {
                NFT.image = resolveLink(data.image);
                NFT.name = resolveLink(data.name); 
                NFT.description = resolveLink(data.description); 
              });
          } catch (error) {
            setFetchSuccess(false);
           }
          }
      }
      setCollectionNFTs(NFTs);
    }
  }, [data]);

  return { getCollections, CollectionNFTs, error, isLoading };
};

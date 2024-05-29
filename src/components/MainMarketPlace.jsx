import React, { useState, useEffect, useCallback } from "react";
import {
  useMoralis,
  useMoralisQuery,
  useMoralisCloudFunction,
} from "react-moralis";
import { getNativeByChain } from "helpers/networks";
import { Card, Image, Tooltip, Modal, Badge, Alert, Spin, notification, Button } from "antd";
import { useMarketNFTs } from "hooks/useMarketNFTs";
import {
  FileSearchOutlined,
  RightCircleOutlined,
  SendOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useMainDapp } from "providers/MainDapp/MainDapp";
import { getExplorer } from "helpers/networks";
import { useWeb3ExecuteFunction } from "react-moralis";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useHistory,
} from "react-router-dom";
import App from "App";

const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
};

function MainMarketPlace() {
  const { MarketNFTs, getMarketNFTs, isLoadingMarketNFTs } = useMarketNFTs();
  const { chainId, marketAddress, contractABI, walletAddress } = useMainDapp();
  const { Moralis, user } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const nativeName = getNativeByChain(chainId);
  const contractProcessor = useWeb3ExecuteFunction();
  const purchaseItemFunction = "createMarketSale";
  const contractABIJson = JSON.parse(contractABI);
  const [nftToBuy, setNftToBuy] = useState();
  const queryMarketItems = useMoralisQuery("CreatedMarketItems");
  let history = useHistory();

  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "objectId",
      "createdAt",
      "price",
      "nftContract",
      "itemId",
      "sold",
      "tokenId",
      "seller",
      "owner",
      "confirmed",
    ])
  );

  useEffect(() => {
    getMarketNFTs();
  }, []);

  async function purchase() {
    const tokenDetails = getMarketItem(nftToBuy);
    const itemID = tokenDetails.itemId;
    const tokenPrice = tokenDetails.price;
    const ops = {
      contractAddress: marketAddress,
      functionName: purchaseItemFunction,
      abi: contractABIJson,
      params: {
        nftContract: nftToBuy.token_address,
        itemId: itemID,
      },
      msgValue: tokenPrice,
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
    
        succBuy();
        updateSoldMarketItem();
      },
      onError: (error) => {
     
       failBuy();
      },
    });
  }


  function succBuy() {
    let secondsToGo = 10;
     notification.success({
      message: `Success`,
      description:
        'Your NFT was bought and is now in your wallet.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function failBuy() {
    let secondsToGo = 15;
     notification.error({
      message: `Error!`,
      description:
        'There was a problem buying your NFT.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }



  const handleBuyClick = (nft) => {
    setNftToBuy(nft);
    setVisibility(true);
  };

  async function updateSoldMarketItem() {
    const id = getMarketItem(nftToBuy).objectId;
    const marketList = Moralis.Object.extend("CreatedMarketItems");
    const query = new Moralis.Query(marketList);
    await query.get(id).then((obj) => {
      obj.set("sold", true);
      obj.set("owner", walletAddress);
      obj.save();
    });
  }

  var loadUsers = async (id, nft) => {
    const allusers = await Moralis.Cloud.run("loadUsers");
    // let FetchedUser = allusers.find((v) => v?.seller === id) || {};
    // history.push("/nftMarket/" + FetchedUser?.username); 
   // console.log(allusers);
    var result;
    var ethadd;
    var avatar;
    var avapfp;
    var data;

    allusers.forEach((usr, i) => {
      var dateString = new Date(usr.updatedAt);
      let formatted_date =
        dateString.getDate() +
        "/" +
        (dateString.getMonth() + 1) +
        "/" +
        dateString.getFullYear();
      let s = fetchMarketItems?.find(
        (e) =>
          e.nftContract === nft?.token_address &&
          e.tokenId === nft?.token_id &&
          e.sold === false &&
          e.confirmed === true &&
          e.seller === usr.ethAddress
      );
      if (s) {
        result = usr.username;
        ethadd = s.seller;
        avatar = usr.avatar;
        
         if(avatar){
          avapfp = avatar._url;

         } else {

         avapfp = "https://i.imgur.com/lIM36oz.jpg";
         }

      }

    
      
      //
      if (allusers?.length === i + 1) {
        // console.log(ethadd)
     
       // setUserInfoArray({ Ethereum: ethadd ,  Username: result, Avatar: avatar })

        //history.push("/nftMarket/" + result);
        history.push({
          pathname: "/discover/" + result, /* this path field is based on your project */
          state: data ? data : { Ethereum: ethadd ,  Username: result, Avatar: avapfp } /* pass state data to app page */,
        });
      }
    });
  };

  const handleMetadataChange = async () => {
    //let userToken = loadUsers();
    //  userToken.then(function(result) {
    //return result;
    // })
  };

  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        e.nftContract === nft?.token_address &&
        e.tokenId === nft?.token_id &&
        e.sold === false 
      
    );
    // console.log(result);
    return result;
  };




  // console.log("MarketNFTs", MarketNFTs);
  return (
    <div>
      <div style={styles.NFTs}>
        {MarketNFTs &&
            MarketNFTs.map((nft, index) => (
            <Card
              hoverable
              actions={[
                <Tooltip title="View On Blockexplorer">
                  <FileSearchOutlined
                    onClick={() =>
                      window.open(
                        `${getExplorer(chainId)}address/${nft.token_address}`,
                        "_blank"
                      )
                    }
                  />
                </Tooltip>,
                <Tooltip title="Buy this NFT">
                  <ShoppingCartOutlined onClick={() => handleBuyClick(nft)} />
                </Tooltip>,
              ]}
              style={{  width: 300, border: "2px solid #1890ff",  margin: "13.2px",
              borderRadius: "20px",
              overflow: "hidden"}}
              cover={
                <Image
                  preview={false}
                  src={nft?.image || "error"}
                  fallback=""
                  alt=""
                  style={{ height: "300px", padding: "1rem", borderRadius: "20px" }}
                />
              }
              key={index}
            >
              {getMarketItem(nft) && (
                <Badge.Ribbon text="Buy Now" color="blue"></Badge.Ribbon>
              )}
              {getMarketItem(nft) && (
               <NavLink to="#" onClick={() => loadUsers(nft?.seller, nft)}> Owner </NavLink>
                
              )}
                <Meta title={nft.name} description={nft.description} >   </Meta>
              <p style={{float: 'right'}}>{`#${nft.token_id}`} </p>
            </Card>

          ))} 
      </div>
      {getMarketItem(nftToBuy) ? (
        <Modal
          title={`Buy ${nftToBuy?.name || "NFT"}`}
          visible={visible}
          onCancel={() => setVisibility(false)}
          onOk={() => purchase()}
          okText="Buy"
        >
          <div
            style={{
              width: "250px",
              margin: "auto",
            }}
          >
            <Badge.Ribbon
              text={`${
                getMarketItem(nftToBuy).price / ("1e" + 18)
              } ${nativeName}`}
              color="blue"
            >
              <img
                src={nftToBuy?.image}
                style={{
                  width: "250px",
                  margin: "auto",
                  borderRadius: "10px",
                  maginBottom: "15px",
                }}
              />
            </Badge.Ribbon>
          </div>
        </Modal>
      ) : (
        <Modal
          title={`Buy ${nftToBuy?.name} #${nftToBuy?.token_id}`}
          visible={visible}
          onCancel={() => setVisibility(false)}
          onOk={() => setVisibility(false)}
          okText="OK"
        >
          <img
            src={nftToBuy?.image}
            style={{
              width: "250px",
              margin: "auto",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          />
          <Alert style={{ fontWeight: "500"}} message="This NFT is currently not for sale" type="info" />
        </Modal>
      )}
    </div>
  );
}

export default MainMarketPlace;

import React, { useState, useEffect } from "react";
import { useMoralis, useWeb3ExecuteFunction, useMoralisQuery, useIPFS } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Alert, Select, notification ,Radio ,Spin, Button } from "antd";
import { useMyNFTs } from "hooks/useMyNFTs";
import { FileSearchOutlined, SendOutlined, RollbackOutlined , ShoppingCartOutlined } from "@ant-design/icons";
import { useMainDapp } from "providers/MainDapp/MainDapp";
import { getExplorer } from "helpers/networks";
import AddressInput from "./AddressInput";
import { useMarketNFTs } from "hooks/useMarketNFTs";


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

function MyNFTs() {
  const { MyNFTs, getMyNFTs, isLoading } = useMyNFTs();
  const { MarketNFTs, getMarketNFTs, isLoadingMarketNFTs } = useMarketNFTs();
  const { walletAddress, chainId, marketAddress, contractABI, tokenABI } = useMainDapp();
  const { Moralis, isAuthenticated } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [modals1, setOpen1] = useState(false);
  const [modals2, setOpen2] = useState(false);
  const [modals3, setOpen3] = useState(false);
  const [price, setPrice] = useState ();
  const [receiverToSend, setReceiver] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [nftToDelist, setNftToDelist] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [nftPage, setnftPage] = useState(1);
  const [ValueOfButtons, setValueOfButtons] = useState("0");
  const [value, setValue] = useState();
  const [alertDat, setalertDat] = useState("");
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(contractABI);
  const tokenABIJson = JSON.parse(tokenABI);
  const listItemFunction = "createMarketItem" ;
  const TransferNftFunction = "transferAnNft" ;
  const delistItemFunction = "delistMarketItem" ;
  const ItemImage = Moralis.Object.extend("ItemImages");
  const queryMarketItems = useMoralisQuery("CreatedMarketItems");
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
  ).filter(
    (item) => item.seller === walletAddress );
    
  useEffect(() => {
   getMyNFTs();
   getMarketNFTs();
  }, []);

  async function List(nft, currentPrice) {
    if (currentPrice <= 0){
       setalertDat("negative number or 0");
      return;
    }

    setIsPending(true);
     const p = currentPrice * ("1e" + 18);
     const ops = {
       contractAddress: marketAddress,
       functionName: listItemFunction,
       abi: contractABIJson,
       params: {
          nftContract: nft.token_address,
          tokenId: nft.token_id,
          price: String(p)

       }

     };
     
     await approveAll(nft);
     await contractProcessor.fetch({
      params: ops,

      onSuccess: () =>{
        succList();
        addItemImage();
        setIsPending(false);
        setVisibility(false);
      },
      onError: (error) => {
        setIsPending(false);
         // alert(error);
        failList();
      },

     });
  }
 

  async function deList() {
    setIsPending(true);
    const tokenDetails = getMarketItem(nftToDelist);
    const itemID = tokenDetails.itemId;
    const tokenId = nftToDelist.token_id;
    const ops = {
      contractAddress: marketAddress,
      functionName: delistItemFunction,
      abi: contractABIJson,
      params: {
        nftContract: nftToDelist.token_address,
        tokenId: tokenId,
        itemId: itemID
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {

    
       succDelist();
       updateDelistedMarketItem();
       setVisibility(false);
       setIsPending(false);
      },
      onError: (error) => {
        setIsPending(false);
        failDelist();
        
      },
    });
  }
   
  async function transfer(nft, receiver) {
    const options = {
      contractAddress: marketAddress,
      functionName: TransferNftFunction,
      abi: contractABIJson,
      params: {
      nftContract: nft.token_address,
      tokenId: nft.token_id,
      recieverAddress: receiver,
    }

    };

    setIsPending(true);
    await approveAll(nft);
    await contractProcessor.fetch({
      params: options,
    
    onSuccess: () =>{
      
      succTrans();
      setIsPending(false);
    },
    onError: (error) => {
      setIsPending(false);
      failTrans();
   
    },
    });

  }
 
  async function approveAll(nft) {
     
    let web3 = await Moralis.Web3.enableWeb3();
    var contract = new web3.eth.Contract(tokenABIJson, nft.token_address);
    const approvedAddress =  await contract.methods.isApprovedForAll(walletAddress, marketAddress).call({from: walletAddress});
    console.log("approved true o false?", approvedAddress);
  
    const ops = {
      contractAddress: nft.token_address,
      functionName: "setApprovalForAll",
      abi: [{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      params: {
        operator: marketAddress,
        approved: true
      },
    };
    setIsPending(true); 
    if(approvedAddress === false){
    
    
    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("Approval Received");
        setIsPending(false);
      //  setVisibility(false);
        succApprove();
      },
      onError: (error) => {
        setIsPending(false);
        failApprove();
      },
    });
     }
     else {
      console.log("Approval Received");
      setIsPending(false);
//      setVisibility(false);
      succApprove();
     // return;
     }

    
  }

  async function updateDelistedMarketItem() {
    const id = getMarketItem(nftToDelist).objectId;
    const MarketItemsList = Moralis.Object.extend("CreatedMarketItems");
    const query = new Moralis.Query(MarketItemsList);
    await query.get(id).then((obj) => {
      obj.set("sold", true);
      obj.set("owner", walletAddress);
      obj.save();
    });
  }


  function succDelist() {
    let secondsToGo = 5;
     notification.success({
      message: `Success`,
      description:
        'Your NFT was delist from the marketplace.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function succTrans() {
    let secondsToGo = 5;
     notification.success({
      message: `Success`,
      description:
        'Your NFT Transfered.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function succList() {
    let secondsToGo = 5;
     notification.success({
      message: `Success`,
      description:
        'Your NFT was listed and is now on the marketplace.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function succApprove() {
    let secondsToGo = 5;
     notification.success({
        message: `Success`,
        description:
          'Approval is now set, you may list or Transfer your NFT.',
          placement: 'bottomRight',
      });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function failList() {
    let secondsToGo = 5;
     notification.error({
      message: `Error!`,
      description:
        'There was a problem listing your NFT.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function failDelist() {
    let secondsToGo = 5;
     notification.error({
      message: `Error!`,
      description:
        'There was a problem delisting your NFT.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  function failApprove() {
    let secondsToGo = 5;
     notification.error({
      message: `Error!`,
      description:
        'There was a problem with setting approval.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }


  function failTrans() {
    let secondsToGo = 5;
     notification.error({
      message: `Error!`,
      description:
        'There was a problem with transfering your NFT.',
        placement: 'bottomRight',
    });
    setTimeout(() => {
      notification.destroy();
    }, secondsToGo * 1000);
  }

  const handleTransferClick = (nft) => {
    
    setNftToSend(nft);
    setOpen1(true);
    setVisibility(true);
    

  };

  const handleSellClick = (nft) => {
    
    setNftToSend(nft);
    setOpen2(true);
    setVisibility(true);
   
  };

  const handleDelistClick = (nft) => {
    
    setNftToDelist(nft);
    setOpen3(true);
    setVisibility(true);
   
  };

  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        e.nftContract === nft?.token_address &&
        e.tokenId === nft?.token_id &&
        e.sold === false 
    );
    return result;
  };

  function addItemImage() {
    const itemImage = new ItemImage();

    itemImage.set("image", nftToSend.image);
    itemImage.set("nftContract", nftToSend.token_address);
    itemImage.set("tokenId", nftToSend.token_id);
    itemImage.set("collectionName", nftToSend.name);

    itemImage.save();
  }

 //console.log(typeof fetchMarketItems);
  if (!isAuthenticated) {
    return (
        <h1 >you're not logged in</h1>
    );
  }
  return (
    <> 

    <div>
    <div style={{Align: 'left' }}>
    <Radio.Group value={ValueOfButtons} onChange={e => setValueOfButtons(e.target.value) }>
     <Radio.Button value="0" onClick={() => setnftPage(1) }> My NFTS </Radio.Button>   
     <Radio.Button  value="1" onClick={() => setnftPage(2)}> Listed NFTs </Radio.Button> 
    </Radio.Group>
        </div> 
      <br /> 
    
      <div style={styles.NFTs}>
       {MyNFTs &&  nftPage === 1 && 
          MyNFTs.map((nft, index) => (
            <Card
              hoverable
              actions={[
                <Tooltip title="View On Blockexplorer">
                  <FileSearchOutlined
                    onClick={() =>
                      window.open(`${getExplorer(chainId)}address/${nft.token_address}`, "_blank")
                    }
                  />
                </Tooltip>,
                <Tooltip title="Transfer NFT">
                  <SendOutlined onClick={() => handleTransferClick(nft)} />
                </Tooltip>,

                <Tooltip title="List this NFT">
                  <ShoppingCartOutlined onClick={() => handleSellClick(nft)} />
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
             <Meta title={nft.name} description={nft.description} >   </Meta>
              <p style={{float: 'right'}}>{`#${nft.token_id}`} </p>
            </Card>
          ))}

         {isLoading === false &&  nftPage === 1 && !MyNFTs.length && isAuthenticated && (<h1 >No assets owned & nfts not loaded</h1>) }

      </div> 

     <div style={styles.NFTs}>
        {MarketNFTs &&
          nftPage === 2 &&
            MarketNFTs.map((nft, index) => (
              
              getMarketItem(nft) &&
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
                <Tooltip title="Delist this NFT">
                  <RollbackOutlined onClick={() => handleDelistClick(nft)} />
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
              <Meta title={nft.name} description={nft.description} >   </Meta>
              <p style={{float: 'right'}}>{`#${nft.token_id}`} </p>
            </Card>
              
          ))} 

         { fetchMarketItems.length  === 0 && nftPage === 2 && <h1 >you haven't listed anything</h1>}
      </div>

     
      </div>
     
     {modals1 && <Modal 
      
        title={`Transfer ${nftToSend?.name || "NFT"}`}
        visible={visible}
        onCancel={() => {setVisibility(false); setOpen1(false);} }
        onOk={() => transfer(nftToSend, receiverToSend)}
        afterClose={() => setOpen1(false)}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={(e) => setReceiver(e)} />
        
       
        </Modal> }

     {modals2 && <Modal
      
        title={`List ${nftToSend?.name} #${nftToSend?.token_id} For Sale`}
        visible={visible}
        onCancel={() => {setVisibility(false); setOpen2(false); }}
        afterClose={() => setOpen2(false)}
        onOk={() => List(nftToSend, price)}
        okText="List"
        footer={[
          <Button onClick={() => setVisibility(false)}>
            Cancel
          </Button>,
          <Button onClick={() => List(nftToSend, price)} type="primary">
            List
          </Button>
        ]}
      >
        <Spin spinning={isPending}>
          <img
            src={`${nftToSend?.image}`}
            style={{
              width: "250px",
              margin: "auto",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          />
          <Input
            autoFocus
            placeholder="Listing Price in MATIC"
            
            onChange={(e) => { setPrice(e.target.value); setalertDat(""); }}
          /> 
          <span style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat }}/> 
        </Spin>
      </Modal> } 

      {modals3 && <Modal
          title={`Delist ${nftToDelist?.name || "NFT"}`}
          visible={visible}
          onCancel={() => {setVisibility(false); setOpen3(false); }}
          onOk={() => deList()}
          afterClose={() => setOpen3(false)}
          okText="Delist"
        >
          <div
            style={{
              width: "250px",
              margin: "auto",
            }}
          >
              <img
                src={nftToDelist?.image}
                style={{
                  width: "250px",
                  margin: "auto",
                  borderRadius: "10px",
                  maginBottom: "15px",
                }}
              />
          </div>
        </Modal> }

    </>
  );
}

export default MyNFTs;

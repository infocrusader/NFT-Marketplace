import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useMainDapp } from "providers/MainDapp/MainDapp";
import { getNativeByChain } from "helpers/networks";
import { Table, Tag, Space, Button, Image } from "antd";

import moment from "moment";
import { PolygonCurrency } from "helpers/formatters";

const styles = {
   table : {
      margin: "0 auto",
      width: "1000px",
   },
};

function Transactions(){
   const { walletAddress } = useMainDapp();
   const { isAuthenticated } = useMoralis();
  const queryItemImages = useMoralisQuery("ItemImages");
  const fetchItemImages = JSON.parse(
    JSON.stringify(queryItemImages.data, [
      "nftContract",
      "tokenId",
      "collectionName",
      "image",
    ])
  );

  //console.log(fetchItemImages);
  const queryMarketItems = useMoralisQuery("CreatedMarketItems");
  const fetchMarketItems = JSON.parse(
      JSON.stringify(queryMarketItems.data, [
        "updatedAt",
        "price",
        "nftContract",
        "itemId",
        "sold",
        "tokenId",
        "seller",
        "owner",
      ])
    )
   .filter(
        (item) => item.seller === walletAddress || item.owner === walletAddress
   ).sort ((a, b) =>

   a.updatedAT < b.updatedAt ? 1 : b.updtedAt < a.updatedAT ? -1:0
   );


   const queryMintedItems = useMoralisQuery("MintedItems");
   const fetchMintedItems = JSON.parse(
       JSON.stringify(queryMintedItems.data, [
         "CollectionName",
         "name",
         "updatedAt",
         "createdAt",
         "nftFilePath",
         "nftContract",
         "tokenId",
         "creator",
         "price",
         "minted",
       ])
     )
    .filter(
         (item) => item.creator === walletAddress ).sort ((a, b) =>
 
    a.updatedAT < b.updatedAt ? 1 : b.updtedAt < a.updatedAT ? -1:0
    );

    const data = fetchMarketItems?.map((item, index) => ({
        key: index,
        date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
        collection: item.nftContract,
        item: item.tokenId,
        tags:  [ item.seller ,  item.sold  ] ,
        price: item.price / ("1e" + 18),
    }));

    
    const datax = fetchMintedItems?.map((item, index) => ({
      key: index= index + 200,
      date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
      collection: item.nftContract,
      item: item.tokenId,
      tags: [ item.creator , item.minted ],
      price: item.price / ("1e" + 18),
      }));
  
      

  const sectionRowsMerged = data.concat(datax);

    function getImage(addrs, id) {
    const img = fetchItemImages.find(
      (element) =>
        element.nftContract === addrs &&
        element.tokenId === id
    );
    return img?.image;
  }

  function getName(addrs, id) {
    const nme = fetchItemImages.find(
      (element) =>
        element.nftContract === addrs &&
        element.tokenId === id
    );
    return nme?.collectionName;
  }
  
 

    const columns = [
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
        },
        {
          title: "Item",
          key: "item",
          render: (record) =>  {
            var nftFile = getImage(record.collection, record.item);
          
            //this function changes/sets myVariable
            return (
              <Space size="middle">
              <img src={nftFile} style={{ width: "40px", borderRadius:"4px"}} />
              <span>#{record.item} </span>
            </Space>
            );
         },
        },
        {
          title: "Collection",
          key: "collection",
          render: (text, record) => (
            <Space size="middle">
              <span> {getName(record.collection, record.item)}</span>
            </Space>
          ),
        },
        {
          title: "Transaction Status",
          key: "tags",
          dataIndex: "tags",
          render: (tags, record) => (
            <>
              {tags.map((tag) => {
                let color = "geekblue";
                let status = "BUY";
                if (tag === false) {
                  color = "volcano";
                  status = "LISTED";
                } else if (tag === true) {
                  color = "green";
                  status = "confirmed";
                
                } else if (tag === "minted" && String(record.price) === "NaN"){
                  color = "red";
                  status = "NOT LISTED";
                } else if (tag === "minted" && String(record.price) !== "NaN"){
                  color = "red";
                  status = "LISTED";
                }
                if (tag === walletAddress && tags[1] !== "minted")  {
                  status = "SELL";
                } else if(tag === walletAddress && tags[1] === "minted")  {
                  status = "Minted";
                }
                return (
                  <Tag color={color} key={tag}>  {status.toUpperCase()}  </Tag>
                );
              })}
            </>
          ),
         
        },
        {
          title: "Price",
          key: "price",
          dataIndex: "price",
          render: (e) =>  {
            var x = e;
            if (String(x) === "NaN"){
              x = "N/A";
            } 
            //this function changes/sets myVariable
            return (
              <Space size="middle">
              <PolygonCurrency/>
             <span>{String(x)} </span> 
              </Space>
            );
         },

        }
      ];

     

return (
     
        <>
        <div>
    
    
            <div style={styles.table}>
           { isAuthenticated ? ( <Table style={{ fontFamily: "Roboto, sans-serif", padding: "10px"}} columns={columns} dataSource={sectionRowsMerged}/> ) : (<Table  columns={columns}  dataSource={""} />) }
              
    
            </div>
        </div>
        
        
        </>
)

}


export default Transactions;

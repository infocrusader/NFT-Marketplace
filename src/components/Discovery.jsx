import React, { useEffect, useState, useMemo } from "react";
import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button, Select, Upload, Typography } from "antd";
import { useMoralisFile } from 'react-moralis'
import { Moralis } from 'moralis'
import { useMainDapp } from "providers/MainDapp/MainDapp";
import { useMoralis } from "react-moralis";
import { useUserDiscovery } from "hooks/useUserDiscovery";
import { withRouter, useParams, useHistory, useLocation  } from "react-router-dom";
import { getExplorer } from "helpers/networks";
import { FileSearchOutlined, SendOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Meta } = Card;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
  outerBorder: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: "0 auto",
    width: "600px",
    height: "150px",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "solid 1px #e3e3e3",
  },
  PFP: {
    height: "115px",
    width: "115px",
    borderRadius: "50%",
    border: "solid 4px white",
  },
  text: {
    color: "#041836",
    fontSize: "27px",
    fontWeight: "bold",
  },
};



function Discovery(props) {
  let params = useParams();
  const history = useHistory();
  const location = useLocation();
  const UserInfoArray = location.state;
  const { UserNFTs, loadingState, getUserNFTs } = useUserDiscovery(UserInfoArray.Ethereum);
  const { chainId } = useMainDapp();
  useEffect(() => {
    getUserNFTs();
  }, []);
  if (loadingState === 'loaded' && !UserNFTs.length) return (<h1>No assets owned</h1>)
  return (
    <>
    <div>
          <>
            <div style={styles.outerBorder}>
              <Image
                preview={false}
                src={UserInfoArray.Avatar || "error"}
                fallback="https://i.imgur.com/lIM36oz.jpg"
                alt=""
                style={styles.PFP}
              />
              <div style={styles.text}>
                <>
                  <div>{`${UserInfoArray.Username}`}</div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#9c9c9c",
                      fontWeight: "normal",
                    }}
                  >
                  </div>
                </>
              </div>
            </div>
          </>
      <div style={styles.NFTs}>
        {UserNFTs &&
          UserNFTs.map((nft, index) => (
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
      </div>
      </div>
    </>
  );

}
export default withRouter(Discovery);
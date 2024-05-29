import { useEffect, useState } from "react";
import React from 'react';
import ReactDOM from 'react-dom';
import { useMoralis } from "react-moralis";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	NavLink,
	Redirect,
} from "react-router-dom";
import {
	AppstoreOutlined,
	MenuFoldOutlined,
	SlidersOutlined,
	DatabaseOutlined,
	UploadOutlined,
	MenuUnfoldOutlined,
	ShopOutlined
} from '@ant-design/icons';
import Account from "components/Account";

import MyNFTs from "components/MyNFTs";
import Collections from "components/Collections";
import Discovery from "components/Discovery";
import Transactions from "components/Transactions";
import MintNFT from "components/MintNFT";
import MainMarketPlace from "components/MainMarketPlace";
import FindCollections from "components/FindCollections";
import { Menu, Layout, Row } from "antd";
import "antd/dist/antd.css";

import "./style.css";
import Text from "antd/lib/typography/Text";

const { Header, Sider, Footer, Content } = Layout;

const styles = {
	header: {
		position: "fixed",
		zIndex: 1,
		width: "100%",
		background: "#fff",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		fontFamily: "Roboto, sans-serif",
		borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
		padding: "0 10px",
		boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
	},
	headerRight: {
		display: "flex",
		gap: "5px",
    marginBottom: '0',
		fontSize: "15px",
		fontWeight: "500",
  
	},
};
export default function App() {
	const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();


	const [collectionAddress, setcollectionAddress] = useState("explore");
	const [collapsed, setCollapsed] = useState(true);
	const selectStyle = {Background: "red", Color:"red",  width: "160px", marginBottom:"10px", marginLeft: "20px" };

	useEffect(() => {
		if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
	}, [isAuthenticated, isWeb3Enabled]);

	const toggle = () => setCollapsed(!collapsed);

	const MenuFold = collapsed ? <MenuUnfoldOutlined className="trigger" onClick={toggle} /> : <MenuFoldOutlined className="trigger" onClick={toggle} />;


	return (
		<Layout style={{ height: "100vh", overflow: "auto" }}>
			<Router>
				<Sider

					trigger={null} collapsible collapsed={collapsed}
				>
				{collapsed === false ? (<div> <NFTMLogo /> <FindCollections setcollectionAddress={setcollectionAddress} selectStyle={selectStyle}/> </div>) : (<div  >  < NFTMLogoC/> </div>) }
					
					<Menu theme="dark" mode="inline" defaultSelectedKeys={['MyNFTs']}>
				
					<Menu.Item key="MainMarket" icon={<ShopOutlined />}>
							<NavLink to="/MarketPlace">Marketplace</NavLink>
						</Menu.Item>
						<Menu.Item key="Collections" icon={<AppstoreOutlined />}>
							<NavLink to="/Collections">Collection</NavLink>
						</Menu.Item>
						<Menu.Item key="MyNFTs" icon={<DatabaseOutlined />}>
							<NavLink to="/MyNFTs">Your NFTs</NavLink>
						</Menu.Item>
						<Menu.Item key="Transactions" icon={<SlidersOutlined />}>
							<NavLink to="/Transactions"> Transactions</NavLink>
						</Menu.Item>
						<Menu.Item key="MintNFT" icon={<UploadOutlined />}>
							<NavLink to="/MintNFT"> Mint NFT</NavLink>
						</Menu.Item>
					</Menu>
				</Sider>
				<Layout className="site-layout">
					<Header style={{ padding: 10, background: "#fff", width: "100%" }}>
						<Row style={{ display: "flex", justifyContent: "space-between" }}>
							{MenuFold}
							<Row>

              <div style={styles.headerRight}>
              
               
								<Account/>
                </div>
							</Row>
						</Row>
					</Header>
				 <Content style={{
                        margin: '24px 16px 0 24px',
                        overflow: "auto",
						padding: "10px",
                        borderRadius: '10px',
                    }}>
						<Switch>
							<Route exact path="/MyNFTs">
								<MyNFTs />
							</Route>
							<Route exact path="/MarketPlace">
								<MainMarketPlace />
							</Route>
							<Route exact path="/Collections">
								<Collections collectionAddress={collectionAddress} setcollectionAddress={setcollectionAddress} />
							</Route>
							<Route exact path="/discover/:id">
								<Discovery />
							</Route>
							<Route exact path="/Transactions">
								<Transactions />
							</Route>
							<Route exact path="/MintNFT">
								<MintNFT />
							</Route>
						</Switch>
					
					</Content>
					<Footer style={{  marginTop: '-1%', textAlign: 'center' }}>NFTEAM Marketplace ©2022</Footer>
				</Layout>
			</Router>

		</Layout>
	);
};

export const NFTMLogo = () => (
	<div style={{  margin: "30px 0 10px 0"}}>
	     <img src="https://i.imgur.com/ub2FpiT.png" alt="NFTM Logo" draggable="false" width="100%" />
	</div>
  );


  export const NFTMLogoC = () => (
	<div style={{  margin: "30px 0 10px 0"}}>
	     <img src="https://i.imgur.com/j2xbLOx.png" alt="NFTM Logo" draggable="false" width="100%" />
	</div>
  );

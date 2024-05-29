import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.css";

import { MainDapp } from "./providers/MainDapp/MainDapp";

const DAPP_ID = process.env.REACT_APP_NFTMARKET_DAPP_ID;
const DAPP_SRVR_URL = process.env.REACT_APP_CUSTOM_VARIABLE;

const Application = () => {
  const isServerInfo = DAPP_ID && DAPP_SRVR_URL ? true : false;
  if (isServerInfo)
    return (
      <MoralisProvider appId={DAPP_ID} serverUrl={DAPP_SRVR_URL}>
        <MainDapp>
          <App isServerInfo />
        </MainDapp>
      </MoralisProvider>
    );
  else {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
     
      </div>
    );
  }
};

ReactDOM.render(
  <Application />,
  document.getElementById("root")
);

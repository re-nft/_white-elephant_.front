import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DappContextProvider } from "./contexts/Dapp";
import { ContractsContextProvider } from "./contexts/Contracts";
// import { MeContextProvider } from "./contexts/Me";
import "./styles/index.scss";

ReactDOM.render(
  <React.StrictMode>
    <DappContextProvider>
      <ContractsContextProvider>
        {/* <MeContextProvider> */}
        <App />
        {/* </MeContextProvider> */}
      </ContractsContextProvider>
    </DappContextProvider>
  </React.StrictMode>,
  document.getElementById("react-root")
);

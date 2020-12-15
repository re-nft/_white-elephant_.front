import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DappContextProvider } from "./contexts/Dapp";
import { ContractsContextProvider } from "./contexts/Contracts";
import "./styles/index.scss";

ReactDOM.render(
  <React.StrictMode>
    <DappContextProvider>
      <ContractsContextProvider>
        <App />
      </ContractsContextProvider>
    </DappContextProvider>
  </React.StrictMode>,
  document.getElementById("react-root")
);

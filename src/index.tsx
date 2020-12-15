import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DappContextProvider } from "./contexts/Dapp";
import "./styles/index.scss";

ReactDOM.render(
  <React.StrictMode>
    <DappContextProvider>
      <App />
    </DappContextProvider>
  </React.StrictMode>,
  document.getElementById("react-root")
);

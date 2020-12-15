import React, { useContext } from "react";
import { Box, Button } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import Ticket from "./Ticket";

export const Intro: React.FC = () => {
  const { provider, signer, connect } = useContext(DappContext);

  console.debug(signer);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "space-around",
      }}
    >
      <Box>
        <Button onClick={connect} variant="outlined">
          Connect Wallet
        </Button>
      </Box>
      <Box
        style={{
          border: "2px solid black",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1>Rules</h1>
        <ul>
          <li>1. Single ticket per unique address</li>
          <li>2. On Christmas day, take turns to unwrap or steal</li>
          <li>3. By the end of the event, presents get delivered by Santa</li>
          <li>Ho ho ho, with ❤️ reNFT Labs</li>
        </ul>
      </Box>
      <Ticket />
    </Box>
  );
};

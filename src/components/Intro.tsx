import React, { useContext } from "react";
import { Box, Button, Typography } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import Ticket from "./Ticket";

const Intro: React.FC = () => {
  const { address, connect } = useContext(DappContext);

  const short = (s: string): string =>
    `${s.substr(0, 5)}...${s.substr(s.length - 5, 5)}`;

  const refreshPage = () => {
    window.location.reload(false);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "space-around",
      }}
    >
      <Box style={{ marginBottom: "2em" }}>
        {!address && (
          <Button onClick={connect} variant="outlined">
            Connect Wallet
          </Button>
        )}
        {address && (
          <Box style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>
              <span style={{ fontWeight: "bold" }}>Welcome</span>,{" "}
              {short(address)}
            </Typography>
            <Button variant="outlined" onClick={refreshPage}>
              Disconnect
            </Button>
          </Box>
        )}
      </Box>
      <Box
        style={{
          border: "2px solid black",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1 style={{ marginBottom: "1em" }}>Rules</h1>
        <ul>
          <li>1. Single ticket per unique address</li>
          <li>2. On Jan 3rd 23:59:59 GMT, take turns to unwrap or steal</li>
          <li>3. By the end of the event, presents get delivered by Santa</li>
          <li>
            4. Player whose turn it is has 3 hours to unwrap. If they do not
            unwrap or steal in time, a random NFT is assigned to them
          </li>
          <li style={{ marginTop: "1em" }}>
            Ho ho ho, with{" "}
            <span role="img" aria-label="heart">
              ❤️
            </span>{" "}
            reNFT Labs
          </li>
        </ul>
      </Box>
      <Ticket />
    </Box>
  );
};

export default Intro;

import React from "react";
import { Button, Box } from "@material-ui/core";

export const Intro = () => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box>
        <h1>Rules</h1>
        <ul>
          <li>1. Single ticket per unique address</li>
          <li>2. On Christmas day, take turns to unwrap or steal</li>
          <li>3. By the end of the event, presents get delivered by Santa</li>
          <li>Ho ho ho, with ❤️ reNFT Labs</li>
        </ul>
      </Box>
      <Box>
        <h1 style={{ margin: "auto" }}>0.001 ETH</h1>
        <Button
          variant="outlined"
          style={{ height: "40px", background: "lightblue" }}
        >
          Buy ETH
        </Button>
      </Box>
    </Box>
  );
};

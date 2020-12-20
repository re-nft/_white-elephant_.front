import React from "react";
import { Box } from "@material-ui/core";
import { Telegram, Twitter } from "@material-ui/icons";

export default function Header() {
  return (
    <Box style={{ position: "absolute", top: "0", right: "0" }}>
      <Box style={{ margin: "2em" }}>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Box>We love to stick around the cool kids:</Box>
          <a
            href="https://t.me/renftlabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Telegram />
          </a>
          <a
            href="https://twitter.com/renftlabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter />
          </a>
        </Box>
      </Box>
    </Box>
  );
}

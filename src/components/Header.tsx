import React from "react";
import { Box } from "@material-ui/core";
import { Telegram, Twitter } from "@material-ui/icons";

import Discord from "../public/img/discord.svg";
import Medium from "../public/img/medium.svg";

export default function Header() {
  console.error(Medium);
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
            style={{ height: "25px", width: "25px" }}
            href="https://discord.gg/tyqm8t4huz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Discord} />
          </a>
          <a
            style={{ height: "25px", width: "25px" }}
            href="https://medium.com/renftlabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Medium} />
          </a>
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

import React from "react";
import { Box, Typography } from "@material-ui/core";

export default function Footer() {
  return (
    <Box style={{ marginLeft: "2em", paddingBottom: "2em" }}>
      <Typography>
        If you have the itch to support us, here is our{" "}
        <span style={{ fontWeight: "bold" }}>
          <a
            href="https://etherscan.io/address/0x28f11c3D76169361D22D8aE53551827Ac03360B0"
            target="_blank"
            rel="noopener noreferrer"
          >
            multi-sig
          </a>
        </span>
        , infinite gratitude{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>{" "}
      </Typography>
    </Box>
  );
}

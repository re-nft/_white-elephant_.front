import React from "react";
import { Box, Typography } from "@material-ui/core";

export default function Footer() {
  return (
    <Box>
      <Typography>
        Feel free to support us by donating to reNFT multi-sig:{" "}
        <span style={{ fontWeight: "bold" }}>
          <a href="https://etherscan.io/address/0x28f11c3D76169361D22D8aE53551827Ac03360B0">
            0x28f11c3D76169361D22D8aE53551827Ac03360B0
          </a>
        </span>
      </Typography>
    </Box>
  );
}

import React, { useState } from "react";
import { Box, Typography } from "@material-ui/core";
import Snackbar, { SnackbarOrigin } from "@material-ui/core/Snackbar";
import Cookie from "../public/img/undraw_cookie_love_ulvn.svg";

export interface State extends SnackbarOrigin {
  open: boolean;
}

export default function Footer() {
  const [state, setState] = useState<State>({
    open: true,
    vertical: "bottom",
    horizontal: "right",
  });
  const { vertical, horizontal, open } = state;
  const handleClose = () => {
    setState((prevState) => ({ ...prevState, open: false }));
  };
  return (
    <Box>
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
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        autoHideDuration={6000}
        key={vertical + horizontal}
      >
        <Box
          style={{
            background: "yellow",
            display: "flex",
            flexDirection: "row",
            padding: "0.5em",
          }}
        >
          <img
            src={Cookie}
            alt="ga-cookie"
            style={{ height: "1.5em", width: "1.5em", marginRight: "0.5em" }}
          />
          <Typography>
            We hate cookies too. We aren't sharing anything with Google, but we
            use their GA to churn out better products for you
          </Typography>
        </Box>
      </Snackbar>
    </Box>
  );
}

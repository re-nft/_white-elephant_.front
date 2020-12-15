import React, { useContext, useCallback, useState } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import ContractsContext from "../contexts/Contracts";

const Ticket: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const [error, setError] = useState<string>();

  const handleBuy = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    let overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("0.001"), // ether in this case MUST be a string

      // Or you can use Wei directly if you have that:
      // value: someBigNumber
      // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
      // value: "1234567890"
      // value: "0x1234"

      // Or, promises are also supported:
      // value: provider.getBalance(addr)
    };

    try {
      setError("");
      await contract.buyTicket(overrides);
    } catch (err) {
      setError(String(err?.error?.message));
    }
  }, [whiteElephant]);

  return (
    <Box className="ticket">
      <Box className="ticket__content">
        <Box
          style={{ textAlign: "center", margin: "0.5em", paddingTop: "2em" }}
        >
          <h1 style={{ paddingBottom: "0.5em" }}>1 ETH</h1>
          <Button variant="outlined" onClick={handleBuy}>
            Buy
          </Button>
          {error && (
            <Typography
              style={{ color: "red", fontWeight: "bold", paddingTop: "0.5em" }}
            >
              {error}
            </Typography>
          )}
        </Box>
        <Box className="ticket__text">TICKET</Box>
      </Box>
    </Box>
  );
};

export default Ticket;
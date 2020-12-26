import React, { useContext, useCallback, useState } from "react";
import { Box, Button, Typography } from "@material-ui/core";
// import { Alert } from "@material-ui/lab";
import { ethers } from "ethers";

import { randomBytes } from "crypto";
import ContractsContext from "../contexts/Contracts";
import MeContext from "../contexts/Me";

const Ticket: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const { playerInfo, ticketPrice, getTicketInfo } = useContext(MeContext);
  const [error, setError] = useState<string>();

  const handleBuy = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract || ticketPrice === -1) {
      console.debug("no contract instance");
      return;
    }
    let overrides = {
      value: ethers.utils.parseEther(String(ticketPrice)),
    };
    try {
      const value = randomBytes(32);
      // console.debug(`user entropy is: 0x${value.toString("hex")}`);
      const tx = await contract.buyTicket(
        `0x${value.toString("hex")}`,
        overrides
      );
      // await the mining of a single block for confirmation
      await tx.wait(1);
      // trigger update after successful ticket buy
      await getTicketInfo();
      setError("");
    } catch (err) {
      console.error(err);
      // todo: avoid showing unknown when tx is rejected by user
      setError(err?.data?.message || "unknown");
    }
  }, [getTicketInfo, ticketPrice, whiteElephant]);

  return (
    <Box>
      <Box className="ticket">
        <Box className="ticket__content">
          <Box
            style={{ textAlign: "center", margin: "0.5em", paddingTop: "2em" }}
          >
            {!playerInfo.hasTicket && ticketPrice !== -1 && (
              <Box>
                <h1 style={{ paddingBottom: "0.5em" }}>{ticketPrice} ETH</h1>
                <Button variant="outlined" onClick={handleBuy}>
                  Buy
                </Button>
                {error && (
                  <Typography
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      paddingTop: "0.5em",
                    }}
                  >
                    {error}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box className="ticket__text">TICKET</Box>
          {playerInfo.hasTicket && (
            <Box style={{ margin: "1em" }}>
              <span className="rainbow-text">YoU ArE In IT To WIN It</span>
            </Box>
          )}
        </Box>
      </Box>
      {/* <Alert variant="outlined" severity="success">
        This is a success alert — check it out!
      </Alert> */}
    </Box>
  );
};

export default Ticket;

import React, { useContext, useCallback, useState } from "react";
import { Box, Button, Typography } from "@material-ui/core";
// import { Alert } from "@material-ui/lab";
import { ethers } from "ethers";

import ContractsContext from "../contexts/Contracts";
import usePoller from "../hooks/Poller";

const Ticket: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const [error, setError] = useState<string>();
  const [ticketNum, setTicketNum] = useState<string>("-1");
  // dummy 1 ETH ticket price
  const [price, setPrice] = useState<string>("1");

  const handlePrice = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    const _price = await contract.ticketPrice();
    const __price = ethers.utils.formatEther(_price);

    setPrice(__price);
  }, [whiteElephant]);

  const handleBuy = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.debug("no contract instance");
      return;
    }

    const valueToSend = ethers.utils.parseEther(price);

    let overrides = {
      // To convert Ether to Wei:
      value: valueToSend, // ether in this case MUST be a string

      // Or you can use Wei directly if you have that:
      // value: someBigNumber
      // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
      // value: "1234567890"
      // value: "0x1234"

      // Or, promises are also supported:
      // value: provider.getBalance(addr)
    };

    try {
      await contract.buyTicket(overrides);
      setError("");
    } catch (err) {
      setError(err?.data?.message || "unknown");
    }
  }, [whiteElephant, price]);

  const getTicketNum = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance");
      return;
    }
    const orderNum = await contract.myOrderNum();
    const resolvedTicketNum = orderNum === 0 ? "-1" : orderNum;
    setTicketNum(resolvedTicketNum);
  }, [whiteElephant]);

  // todo: ethers.utils has a poll function!
  usePoller(handlePrice, 5000);
  usePoller(getTicketNum, 5000);

  return (
    <Box>
      <Box className="ticket">
        <Box className="ticket__content">
          <Box
            style={{ textAlign: "center", margin: "0.5em", paddingTop: "2em" }}
          >
            {ticketNum === "-1" && (
              <Box>
                <h1 style={{ paddingBottom: "0.5em" }}>{Number(price)} ETH</h1>
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
          <Box style={{ margin: "1em" }}>
            <Typography>Your ticket #: {ticketNum}</Typography>
          </Box>
        </Box>
      </Box>
      {/* <Alert variant="outlined" severity="success">
        This is a success alert — check it out!
      </Alert> */}
    </Box>
  );
};

export default Ticket;

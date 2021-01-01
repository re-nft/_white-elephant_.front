import React, { useContext, useCallback, useState } from "react";
import { Box, Button, Typography, Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ethers } from "ethers";

// import { randomBytes } from "crypto";
import ContractsContext from "../contexts/Contracts";
// import MeContext from "../contexts/Me";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Ticket: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const ticketPrice = 0.1;
  const [error, setError] = useState<string>();
  const [isBuying, setIsBuying] = useState<boolean>(false);

  const handleCloseBuyingAlert = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setIsBuying(false);
  };

  const _handleBuy = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.debug("no contract instance");
      return;
    }
    let overrides = {
      value: ethers.utils.parseEther(String(ticketPrice)),
    };
    try {
      // const value = randomBytes(32);
      const tx = await contract.buyTicket(overrides);
      // await the mining of a single block for confirmation
      await tx.wait(1);
      // trigger update after successful ticket buy
      // await getTicketInfo();
      setError("");
    } catch (err) {
      if (err?.code === 4001) {
        return;
      }
      console.error(err);
      // todo: avoid showing unknown when tx is rejected by user
      setError(err?.data?.message ?? "unknown");
    }
  }, [whiteElephant]);

  const handleBuy = useCallback(async () => {
    Promise.resolve()
      .then(() => setIsBuying(true))
      .then(() => _handleBuy())
      .then(() => setIsBuying(false));
  }, [_handleBuy]);

  return (
    <Box>
      <Box className="ticket">
        <Box className="ticket__content">
          <Box
            style={{ textAlign: "center", margin: "0.5em", paddingTop: "2em" }}
          >
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
          </Box>
          <Box className="ticket__text">TICKET</Box>
          {/* {playerInfo.hasTicket && ( */}
          <Box style={{ margin: "1em" }}>
            <span className="rainbow-text">YoU ArE In IT To WIN It</span>
          </Box>
          {/* )} */}
        </Box>
      </Box>
      <Snackbar
        open={isBuying}
        // autoHideDuration={6000}
        onClose={handleCloseBuyingAlert}
      >
        <Alert onClose={handleCloseBuyingAlert} severity="info">
          Buying thy ticket. Standby...
          <CircularProgress
            color="secondary"
            style={{ height: "18px", width: "18px", marginLeft: "0.5em" }}
          />
        </Alert>
      </Snackbar>
      {/* <Alert variant="outlined" severity="success">
        This is a success alert — check it out!
      </Alert> */}
    </Box>
  );
};

export default Ticket;

import React from "react";
import { Box, Button } from "@material-ui/core";

const Ticket: React.FC = () => (
  <Box className="ticket">
    <Box className="ticket__content">
      <Box style={{ textAlign: "center", margin: "0.5em" }}>
        <h1 style={{ paddingBottom: "0.5em" }}>1 ETH</h1>
        <Button variant="outlined">Buy Ticket</Button>
      </Box>
      <Box className="ticket__text">TICKET</Box>
    </Box>
  </Box>
);

export default Ticket;

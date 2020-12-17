import React from "react";
import { Button, Box, Typography } from "@material-ui/core";

import frame from "../public/img/frame.png";

const Steal = () => {
  return (
    <Box>
      <Typography variant="h3" style={{marginBottom: "2em"}}>
        Thou shall stealeth?
      </Typography>
      <ul>
        <li>
          <img src={frame} alt="painting frame" />
          <span>
            <p>Address:</p>
            <p>Token Id:</p>
            <Button variant="outlined" style={{ marginTop: "2em" }}>
              Steal
            </Button>{" "}
          </span>
        </li>
      </ul>
    </Box>
  );
};

export default Steal;

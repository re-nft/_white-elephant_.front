import React from "react";
import { Box } from "@material-ui/core";
import frame from "../public/img/frame.png";

const MainFrame = () => {
  return (
    <Box>
      <img src={frame} alt="painting frame" />
    </Box>
  );
};

export default MainFrame;

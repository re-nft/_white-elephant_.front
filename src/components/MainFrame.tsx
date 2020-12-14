import React from "react";
import { Box } from "@material-ui/core";
import frame from "../public/img/frame.png";

export const MainFrame = () => {
  return (
    <Box>
      <span
        style={{
          width: "25vw",
          position: "relative",
        }}
      >
        <img
          style={{
            color: "#fff",
            borderColor: "blue",
            height: "50vh",
            marginLeft: "35%",
            marginTop: "16%",
            position: "relative",
          }}
          src={frame}
        />
      </span>
    </Box>
  );
};

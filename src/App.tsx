import React from "react";
import { Box } from "@material-ui/core";

import { Steal } from "./components/Steal";
import { MainFrame } from "./components/MainFrame";
import { Intro } from "./components/Intro";

function App() {
  return (
    <Box style={{ display: "flex", justifyContent: "space-around", flex: 1 }}>
      <Intro />
      <MainFrame />
      <Steal />
    </Box>
  );
}

export default App;

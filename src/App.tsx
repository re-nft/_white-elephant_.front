import React from "react";
import { Box } from "@material-ui/core";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Steal } from "./components/Steal";
import { MainFrame } from "./components/MainFrame";
import { Intro } from "./components/Intro";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Box
            style={{
              display: "flex",
              justifyContent: "space-around",
              flex: 1,
              padding: "4em",
            }}
          >
            <Intro />
            <MainFrame />
            <Steal />
          </Box>
        </Route>
        <Route path="/deposit">
          <Box>ooh special</Box>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

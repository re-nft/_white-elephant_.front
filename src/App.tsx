import React from "react";
import { Box } from "@material-ui/core";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Steal from "./components/Steal";
import MainFrame from "./components/MainFrame";
import Intro from "./components/Intro";
import Deposit from "./components/Deposit";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Box>
            <Box style={{ marginLeft: "1em" }}>
              powered by brainz @{" "}
              <Box className="Header__title" data-text="reNFT">
                <a href="https://twitter.com/renftlabs" data-text="reNFT">
                  reNFT
                </a>
              </Box>
            </Box>
          </Box>
          {/* <Box style={{ textAlign: "center" }}>
            <Typography variant="h4">White Elephant ho ho ho</Typography>
          </Box> */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              padding: "4em",
            }}
          >
            <Box
              style={{
                flex: 1,
                borderRight: "2px solid black",
                paddingRight: "1em",
              }}
            >
              <Intro />
            </Box>
            <Box
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: "2px solid black",
                padding: "0 1em",
              }}
            >
              <MainFrame />
            </Box>
            <Box style={{ flex: 1, textAlign: "center", padding: "0 1em" }}>
              <Steal />
            </Box>
          </Box>
          <Footer />
        </Route>
        <Route path="/deposit">
          <Box style={{ padding: "2em" }}>
            <Deposit />
          </Box>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

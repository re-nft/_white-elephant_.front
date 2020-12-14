import React from "react";
import "./styles/reset.scss";
import { Steal } from "./components/Steal";
import { MainFrame } from "./components/MainFrame";
import { Intro } from "./components/Intro";
import { Navigation } from "./components/Navigation";

function App() {
  return (
    <div>
      <Navigation />
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Intro />
        <MainFrame />
        <Steal />
      </div>
    </div>
  );
}

export default App;

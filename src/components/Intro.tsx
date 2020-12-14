import React from "react";
import { Button } from "react-bootstrap";

export const Intro = () => {
  return (
    <div>
      <div style={{ width: "25vw" }}>
        <h1>Rules</h1>
        <ul>
          <li>Buy a ticket into the gallery</li>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
        </ul>
      </div>
      <div
        style={{
          width: "25vw",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h1 style={{ margin: "auto" }}>0.001 ETH</h1>
        <Button
          variant="primary"
          style={{ height: "40px", background: "lightblue" }}
        >
          Buy ETH
        </Button>{" "}
      </div>
    </div>
  );
};

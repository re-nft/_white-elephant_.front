import React from "react";
import { Button } from "react-bootstrap";

import frame from "../public/img/frame.png";

export const Steal = () => {
  return (
    <div>
      <ul style={{ marginLeft: "20%" }}>
        <li style={{ color: "blue", display: "flex", marginLeft: "10%" }}>
          <img
            style={{
              color: "#fff",
              borderColor: "blue",
              width: "30%",
              marginLeft: "35%",
            }}
            src={frame}
          />
          <span style={{ flexDirection: "column", marginLeft: "15%" }}>
            <p>Address:</p>
            <p>Token Id:</p>
            <Button
              variant="primary"
              style={{ height: "40px", background: "lightblue" }}
            >
              Steal
            </Button>{" "}
          </span>
        </li>
      </ul>
    </div>
  );
};

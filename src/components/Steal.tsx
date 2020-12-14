import React from "react";
import { Button } from "@material-ui/core";

import frame from "../public/img/frame.png";

export const Steal = () => {
  return (
    <div>
      <ul>
        <li>
          <img src={frame} alt="painting frame" />
          <span>
            <p>Address:</p>
            <p>Token Id:</p>
            <Button variant="outlined">Steal</Button>{" "}
          </span>
        </li>
      </ul>
    </div>
  );
};

import React from "react";
import frame from "../public/img/frame.png";
import question from "../public/img/question.png";

export const MainFrame = () => {
  return (
    <div>
      <span
        style={{
          backgroundImage: `url(${question})`,
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
      <img
        src={question}
        style={{
          height: "23%",
          bottom: "44%",
          left: "46%",
          position: "absolute",
        }}
      />
    </div>
  );
};

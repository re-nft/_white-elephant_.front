// import React, { useContext, useState, useCallback } from "react";
import React from "react";
import { Box, Typography } from "@material-ui/core";

// import DappContext from "../contexts/Dapp";
// import ContractsContext from "../contexts/Contracts";

const MainFrame: React.FC = () => {
  // const { address } = useContext(DappContext);
  // const { whiteElephant } = useContext(ContractsContext);
  // const [error, setError] = useState<string>("");

  // const unwrap = useCallback(async () => {
  //   const { contract } = whiteElephant;
  //   if (!contract) return;
  //   try {
  //     const tx = await contract.unwrap();
  //     await tx.wait(1);
  //     enableCheckingPrize();
  //     await getPrizeInfo();
  //   } catch (err) {
  //     setError(err?.data?.message || "unknown");
  //   }
  // }, [enableCheckingPrize, getPrizeInfo, whiteElephant]);

  // const stolenUnwrap = useCallback(async () => {
  //   const { contract } = whiteElephant;
  //   if (!contract) return;
  //   try {
  //     const tx = await contract.unwrapAfterSteal();
  //     await tx.wait(1);
  //     enableCheckingPrize();
  //     await getPrizeInfo();
  //   } catch (err) {
  //     setError(err?.data?.message || "unknown");
  //   }
  // }, [enableCheckingPrize, getPrizeInfo, whiteElephant]);

  return (
    <Box>
      <Box style={{ marginBottom: "4em" }}>
        <Typography variant="h3">
          Thy <span className="rainbow-text">Prize</span> shall-eth be here-eth
        </Typography>
      </Box>
    </Box>
  );
};

export default MainFrame;

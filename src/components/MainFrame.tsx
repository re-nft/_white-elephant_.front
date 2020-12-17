import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Typography } from "@material-ui/core";

import ContractsContext from "../contexts/Contracts";
import frame from "../public/img/frame.png";

const MainFrame: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const [stolen, setStolen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const wasStolenFrom = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;
    const _wasStolenFrom = await contract.myStolenFrom();
    const _nft = await contract.myNftAddress();
    setStolen(
      _nft === "0x0000000000000000000000000000000000000000" && _wasStolenFrom
    );
  }, [whiteElephant]);

  const unwrap = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;
    try {
      const tx = await contract.unwrap();
      console.log("tx", tx);
    } catch (err) {
      console.error("could not unwrap");
      setError(err?.error?.message);
    }
  }, [whiteElephant]);

  useEffect(() => {
    wasStolenFrom();
  }, [wasStolenFrom]);

  return (
    <Box>
      <Box style={{ marginBottom: "4em" }}>
        <Typography variant="h2">Thy Prize</Typography>
      </Box>
      <Box>
        <img src={frame} alt="painting frame" />
      </Box>
      <Box style={{ marginTop: "2em" }}>
        {!stolen && (
          <Button variant="outlined" onClick={unwrap}>
            Unwrap
          </Button>
        )}
        {stolen && (
          <Box>
            <Typography>Oh oh, someone naughty stole from you</Typography>
            <Typography>Go ahead, unwrap or steal</Typography>
            <Typography>Now, noone will be able to steal from you</Typography>

            <Button variant="outlined" onClick={unwrap}>
              Unwrap again...
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainFrame;

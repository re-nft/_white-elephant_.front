import React, { useContext, useCallback, useState } from "react";
import { TextField, Box, Typography, Button } from "@material-ui/core";

import ContractsContext from "../contexts/Contracts";

const Deposit: React.FC = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const [error, setError] = useState<string>();
  const [nftAddress, setNftAddress] = useState<string>();
  const [tokenId, setTokenId] = useState<string>();

  const handleDeposit = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract || !nftAddress || !tokenId) return;
    try {
      await contract.deposit(nftAddress, tokenId);
      setError("");
    } catch (err) {
      setError(err?.error?.message);
    }
  }, [whiteElephant, nftAddress, tokenId]);

  const handleNftAddress = (e: React.ChangeEvent) => {
    e.persist();
    //@ts-ignore
    setNftAddress(e.target?.value || "");
  };

  const handleTokenId = (e: React.ChangeEvent) => {
    e.persist();
    //@ts-ignore
    setTokenId(e.target?.value || "");
  };

  return (
    <Box style={{ border: "2px solid black", padding: "2em" }}>
      <Typography>
        First of all, sorry for the ugly front. We have a small team and we
        deemed that we should cut on some work in some places. We really hope
        you excuse us.
      </Typography>
      <Typography>
        Wise choice, art sensei - the conqueror of creativity
      </Typography>
      <Typography>We have patiently awaited your arrival</Typography>
      <Typography>🍞🧂</Typography>
      <Typography style={{ marginTop: "2em" }}>
        Which NFT are you depositing?
      </Typography>
      {/* todo: add the opensea listed nfts here */}
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Box>
          <TextField label="NFT address" onChange={handleNftAddress}>
            {nftAddress}
          </TextField>
          <TextField label="Token ID" onChange={handleTokenId}>
            {tokenId}
          </TextField>
        </Box>
        {error && (
          <Typography
            style={{ color: "red", fontWeight: "bold", margin: "0.5em 0" }}
          >
            {error}
          </Typography>
        )}
      </Box>
      <Button onClick={handleDeposit}>Deposit</Button>
    </Box>
  );
};

export default Deposit;

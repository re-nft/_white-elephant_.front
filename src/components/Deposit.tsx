import React, { useContext, useCallback, useState, useEffect } from "react";
import { TextField, Box, Typography, Button } from "@material-ui/core";

import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";

const Deposit: React.FC = () => {
  const { connect, addresses } = useContext(DappContext);
  const { whiteElephant, erc721 } = useContext(ContractsContext);
  const [error, setError] = useState<string>();
  const [nftAddress, setNftAddress] = useState<string>();
  const [tokenId, setTokenId] = useState<string>();

  const handleDeposit = useCallback(async () => {
    const { contract } = whiteElephant;
    const { whiteElephant: whiteElephantAddr } = addresses;
    if (!contract || !nftAddress || !tokenId || !whiteElephantAddr) {
      console.debug("no contract, nftAddress, tokenId or whiteElephantAddr");
      return;
    }
    try {
      const isApproved = await erc721.isApproved(
        nftAddress,
        whiteElephantAddr,
        tokenId
      );

      if (!isApproved) {
        await erc721.approve(nftAddress, whiteElephantAddr, tokenId);
      }

      await contract.depositNft(nftAddress, tokenId);
      setError("");
    } catch (err) {
      console.debug("could not deposit");
      setError(err?.error?.message);
    }
  }, [whiteElephant, nftAddress, tokenId, addresses, erc721]);

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

  const approveAll = () => {
    const { whiteElephant: whiteElephantAddr } = addresses;
    if (!nftAddress || !whiteElephantAddr) return;

    try {
      erc721.approve(nftAddress, whiteElephantAddr);
    } catch (err) {
      console.error("could not approve all");
      setError(err?.error?.message);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <Box style={{ border: "2px solid black", padding: "2em" }}>
      <Typography>
        First of all, sorry for the ugly front. We have a small team and we
        deemed that we should cut on some work in some places. We really hope
        you excuse us.
      </Typography>
      <Typography style={{ fontWeight: "bold" }}>Note</Typography>
      <Typography>
        You will get two MetaMask notifications. One to approve your NFT and the
        other to actually transfer it to our contract. You will know that it has
        approved, when you get a notification from your browser, if you have
        those enabled. Sorry, there are no cues about loading anywhere. We were
        aiming to deliver this software ASAP.
        <br />
        Feel free to approve all the NFTs if you have a bunch of NFTs coming
        from the same issuer with the approve all button. You will need to write
        out the NFT address in the text field. You can ignore the token id field
        when doing so.
      </Typography>
      <Typography>------</Typography>
      <Typography style={{ marginTop: "2em" }}>
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
          <TextField
            label="NFT address"
            onChange={handleNftAddress}
            style={{ marginRight: "2em" }}
          >
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
      <Box style={{ marginTop: "2em" }}>
        <Button
          onClick={handleDeposit}
          variant="outlined"
          style={{ marginRight: "1em" }}
        >
          Deposit
        </Button>
        <Button onClick={approveAll} variant="outlined">
          Approve All
        </Button>
      </Box>
    </Box>
  );
};

export default Deposit;

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
      let nfts: string[] = [];
      let tokenIds: string[] = [];
      if (nftAddress.includes(",")) {
        nfts = nftAddress.split(",");
        tokenIds = tokenId.split(",");
      } else {
        nfts = [nftAddress];
        tokenIds = [tokenId];
      }
      if (nfts.length !== tokenIds.length) return;
      // const gasValue = await contract.estimate.deposit(nfts, tokenIds);
      // const gasEstimate = await contract.estimateGas["deposit"](nfts, tokenIds);
      await contract.deposit(nfts, tokenIds);
      setError("");
    } catch (err) {
      console.error(err);
      console.error(Object.keys(err));
      // optional chaining + nullish coalescing
      setError(err?.message ?? "unknown");
    }
  }, [whiteElephant, nftAddress, tokenId, addresses, erc721]);

  const handleNftAddress = (e: React.ChangeEvent) => {
    e.persist();
    //@ts-ignore
    setNftAddress(e.target?.value ?? "");
  };

  const handleTokenId = (e: React.ChangeEvent) => {
    e.persist();
    //@ts-ignore
    setTokenId(e.target?.value ?? "");
  };

  const approveAll = async () => {
    const { whiteElephant: whiteElephantAddr } = addresses;
    if (!nftAddress || !whiteElephantAddr) {
      console.warn("no nft addr or white elephant addr");
      return;
    }
    let nfts = [];
    if (nftAddress.includes(",")) {
      nfts = nftAddress.split(",");
    } else {
      nfts = [nftAddress];
    }
    try {
      for (const nft of nfts) {
        await erc721.approve(nft, whiteElephantAddr);
      }
    } catch (err) {
      console.error("could not approve all");
      setError(err?.error?.message);
    }
  };

  useEffect(() => {
    connect();
  }, [connect]);

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
      <Typography>
        <span role="img" aria-label="bread">
          🍞
        </span>
        <span role="img" aria-label="salt">
          🧂
        </span>
      </Typography>

      <Typography style={{ marginTop: "2em" }}>
        Which NFT are you depositing?
      </Typography>
      <Typography>
        If you want to bulk deposit, add comma after each nft address (with not
        whitespace): e.g. 0x123,0x2221
        <br />
        Same goes for the token id
      </Typography>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Box>
          <TextField
            label="NFT address(es)"
            onChange={handleNftAddress}
            style={{ marginRight: "2em" }}
          >
            {nftAddress}
          </TextField>
          <TextField label="Token ID(s)" onChange={handleTokenId}>
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

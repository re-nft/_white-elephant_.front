import React, { useState, useCallback, useContext } from "react";
import { Button, Box, Typography } from "@material-ui/core";

import usePoller from "../hooks/Poller";
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import MeContext from "../contexts/Me";
import { ethers } from "ethers";

type StealT = {
  currOwner: string;
  nftAddress: string;
  tokenId: number;
  media: Blob;
};

type StealButtonProps = {
  onSteal: (from: string) => Promise<void>;
  from: string;
};

const StealButton: React.FC<StealButtonProps> = ({ onSteal, from }) => {
  const handleSteal = useCallback(async () => {
    return onSteal(from);
  }, [onSteal, from]);

  return (
    <Button onClick={handleSteal} variant="outlined">
      Steal
    </Button>
  );
};

const Steal = () => {
  const { address } = useContext(DappContext);
  const { whiteElephant } = useContext(ContractsContext);
  const { shortcutFetchMedia } = useContext(MeContext);
  const [available] = useState<StealT[]>([]);
  const [, setError] = useState<string>("");

  const isZeroAddress = (_nft: string) => ethers.constants.AddressZero === _nft;
  const sameAddress = (addr1: string, addr2: string) =>
    addr1.toLowerCase() === addr2.toLowerCase();

  // responsible for polling the nfts that can be stolen
  // by the user
  const handleSteal = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    // everything that is above this number
    // and that has not been stolen from yet
    // can be stolen from
    const myTurn = await contract.playersTurn();

    // players before me
    const stealFrom: StealT[] = [];
    for (let i = 0; i < myTurn; i++) {
      const player = await contract.getPlayerNumber(i);
      const [nft, tokenId, , , wasStolenFrom, ,] = await contract.getPlayerInfo(
        player
      );

      const resolvedNft = String(nft);
      const resolvedId = String(tokenId);

      let blob = await shortcutFetchMedia({
        nftAddress: resolvedNft,
        tokenId: resolvedId,
      });

      if (!blob) blob = new Blob();
      if (wasStolenFrom || isZeroAddress(nft) || sameAddress(player, address)) {
        console.debug("can't steal here");
      }
      stealFrom.push({
        currOwner: player,
        nftAddress: nft,
        tokenId: tokenId.toNumber(),
        media: blob,
      });
    }

    // setAvailable(stealFrom);
  }, [whiteElephant, address, shortcutFetchMedia]);

  const stealNft = useCallback(
    async (currOwner: string) => {
      const { contract } = whiteElephant;
      if (!contract) return;

      try {
        await contract.stealNft(currOwner);
        setError("");
      } catch (err) {
        setError(err?.data?.message || "unknown");
      }
    },
    [whiteElephant]
  );

  usePoller(handleSteal, 20000);

  return (
    <Box>
      {available.length > 0 && (
        <Box>
          <Typography variant="h3" style={{ marginBottom: "2em" }}>
            Thou shall-eth steal-eth?
          </Typography>
          {available.map((a) => (
            <Box
              key={`${a.nftAddress}::${a.tokenId}`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Box style={{ marginTop: "2em" }}>
                <Box>
                  <img
                    src={URL.createObjectURL(a.media)}
                    alt="nft"
                    style={{ maxWidth: "300px", maxHeight: "300px" }}
                  />
                </Box>
                <Typography>Current owner: {a.currOwner}</Typography>
                <Typography>NFT Address: {a.nftAddress}</Typography>
                <Typography>Token ID: {a.tokenId}</Typography>
              </Box>
              <Box style={{ marginTop: "2em" }}>
                <StealButton onSteal={stealNft} from={a.currOwner} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Steal;

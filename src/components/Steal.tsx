import React, { useState, useCallback, useContext } from "react";
import { Button, Box, Typography } from "@material-ui/core";

import usePoller from "../hooks/Poller";
import frame from "../public/img/frame.png";
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import { ethers } from "ethers";

// todo: ipfs pull
type StealT = {
  currOwner: string;
  nftAddress: string;
  tokenId: number;
  // todo: add image / animation url
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
  const [available, setAvailable] = useState<StealT[]>([]);
  const [error, setError] = useState<string>("");

  // responsible for polling the nfts that can be stolen
  // by the user
  const handleSteal = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    // everything that is above this number
    // and that has not been stolen from yet
    // can be stolen from
    const myTurn = await contract.myOrderNum();

    // players before me
    const stealFrom: StealT[] = [];
    for (let i = 0; i < myTurn; i++) {
      const player = await contract.getPlayerNumber(i);
      const [nft, tokenId, , , wasStolenFrom, ,] = await contract.getPlayerInfo(
        player
      );

      // todo: add image resolving here
      if (
        !wasStolenFrom &&
        nft !== ethers.constants.AddressZero &&
        player.toLowerCase() !== address.toLowerCase()
      ) {
        stealFrom.push({
          currOwner: player,
          nftAddress: nft,
          tokenId: tokenId.toNumber(),
        });
      }
    }

    setAvailable(stealFrom);
  }, [whiteElephant, address]);

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
              <img src={frame} alt="painting frame" />
              <Box style={{ marginTop: "2em" }}>
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

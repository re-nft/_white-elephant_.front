import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { ethers } from "ethers";

import { fetchIpfs } from "../api/ipfs";
import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";
// import frame from "../public/img/frame.png";
import usePoller from "../hooks/Poller";
import { abis } from "../contracts";
import Spinner from "./Spinner";

type Data = {
  address: string;
  order: number;
};

type Prize = {
  nft: string;
  tokenId: number;
  iWasStolenFrom: boolean;
  media: Blob;
};

type Optional<T> = T | undefined | null;

type UnwrapButtonProps = {
  normalUnwrap: () => Promise<void>;
  stolenUnwrap: () => Promise<void>;
  useStolenUnwrap: boolean;
};

const UnwrapButton: React.FC<UnwrapButtonProps> = ({
  normalUnwrap,
  stolenUnwrap,
  useStolenUnwrap,
}) => {
  const handleUnwrap = useCallback(async () => {
    if (useStolenUnwrap) {
      return await stolenUnwrap();
    }
    return await normalUnwrap();
  }, [normalUnwrap, stolenUnwrap, useStolenUnwrap]);

  return (
    <Button variant="outlined" onClick={handleUnwrap}>
      Unwrap
    </Button>
  );
};

const Table = () => {
  const { whiteElephant } = useContext(ContractsContext);
  const [data, setData] = useState<Data[]>([]);
  const [currTurn, setCurrTurn] = useState<number>(-1);

  const handleData = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    const totalNumPlayers = await contract.numberOfPlayers();

    const allPlayers: Data[] = [];
    for (let i = 0; i < totalNumPlayers; i++) {
      const player = await contract.getPlayerNumber(i);
      allPlayers.push({ address: player, order: i + 1 });
    }

    setData(allPlayers);
  }, [whiteElephant]);

  const handleTurn = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;

    const __currTurn = await contract.currNftToUnwrap();
    let _currTurn = -1;
    try {
      _currTurn = Number(__currTurn);
    } catch (err) {
      console.warn("could not get my order number");
    }

    setCurrTurn(_currTurn);
  }, [whiteElephant]);

  usePoller(handleData, 10000);
  usePoller(handleTurn, 10000);

  if (data.length < 1) return <></>;

  return (
    <table style={{ margin: "auto" }}>
      <thead>
        <tr>
          <th>Address</th>
          <th>Turn</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((d) => (
            <tr
              key={`${d.address}::${d.order}`}
              style={{ background: currTurn === d.order - 1 ? "green" : "" }}
            >
              <td>{d.address}</td>
              <td>{d.order}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

const MainFrame: React.FC = () => {
  const { signer, ipfs, isIpfsReady } = useContext(DappContext);
  const { whiteElephant } = useContext(ContractsContext);
  const [stolen, setStolen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [myPrize, setMyPrize] = useState<Optional<Prize>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const wasStolenFrom = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;
    const _wasStolenFrom = await contract.myStolenFrom();
    const _nft = await contract.myNftAddress();
    setStolen(_nft === ethers.constants.AddressZero && _wasStolenFrom);
  }, [whiteElephant]);

  const unwrap = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;
    try {
      await contract.unwrap();
    } catch (err) {
      setError(err?.data?.message || "unknown");
    }
  }, [whiteElephant]);

  const stolenUnwrap = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) return;
    try {
      await contract.unwrapAfterSteal();
    } catch (err) {
      setError(err?.data?.message || "unknown");
    }
  }, [whiteElephant]);

  const handlePrize = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance, skipping");
      return;
    }

    const nftAddress = await contract.myNftAddress();
    let tokenId = Number(await contract.myTokenId());

    if (nftAddress === myPrize?.nft && tokenId === myPrize?.tokenId) {
      console.debug("same nft, skipping");
      return;
    }

    let iWasStolenFrom = await contract.myStolenFrom();

    const _prize = {
      nft: nftAddress,
      tokenId,
      iWasStolenFrom,
      media: undefined,
    };

    setMyPrize(_prize);
  }, [whiteElephant, myPrize?.nft, myPrize?.tokenId]);

  const fetchMedia = async () => {
    if (!isIpfsReady) {
      console.debug("Ipfs not yet ready");
      return;
    }
    if (isLoading) {
      console.debug("Already loading the media. Skipping...");
      return;
    }
    if (!myPrize) {
      console.debug("no prize just yet, skipping");
      return;
    }
    if (myPrize?.media) {
      console.debug("already fetched the media");
      return;
    }
    setIsLoading(true);

    let _blob;

    if (myPrize.nft !== ethers.constants.AddressZero && signer) {
      const nftContract = new ethers.Contract(myPrize.nft, abis.erc721, signer);
      _blob = await fetchIpfs({
        contract: nftContract,
        tokenId: myPrize.tokenId,
        ipfs,
      });
    }

    setMyPrize((prev) => ({ ...prev, media: _blob }));
    setIsLoading(false);
  };

  usePoller(handlePrize, 10000);
  usePoller(fetchMedia, 10000);

  useEffect(() => {
    wasStolenFrom();
  }, [wasStolenFrom]);

  return (
    <Box>
      <Box style={{ marginBottom: "4em" }}>
        <Typography variant="h2">Thy Prize</Typography>
      </Box>
      <Box style={{ position: "relative" }}>
        {/* <img src={frame} alt="painting frame" /> */}
        {isLoading && (
          <Box style={{ position: "absolute", top: "25%", left: "50%" }}>
            <Spinner />
          </Box>
        )}
        {myPrize && myPrize.media && (
          <img
            src={URL.createObjectURL(myPrize.media)}
            alt="lol"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        )}
      </Box>
      {myPrize && myPrize.nft !== ethers.constants.AddressZero && (
        <Box style={{ marginTop: "2em" }}>
          <Typography>NFT Address: {myPrize.nft}</Typography>
          <Typography>
            Token id:{" "}
            <a
              href={`https://etherscan.io/token/${myPrize.nft}?a=${myPrize.tokenId}`}
            >
              {myPrize.tokenId}
            </a>
          </Typography>
        </Box>
      )}
      <Box style={{ marginTop: "2em" }}>
        {error && (
          <Typography style={{ fontWeight: "bold", color: "red" }}>
            {error}
          </Typography>
        )}
        <Box style={{ marginTop: "2em" }}>
          {stolen && myPrize?.nft === ethers.constants.AddressZero && (
            <Box>
              <Typography>Oh oh, someone naughty stole from you</Typography>
              <Typography>Go ahead, unwrap or steal</Typography>
              <Typography>Now, noone will be able to steal from you</Typography>
            </Box>
          )}
          {myPrize?.nft === ethers.constants.AddressZero && (
            <Box style={{ marginTop: "2em" }}>
              <UnwrapButton
                normalUnwrap={unwrap}
                stolenUnwrap={stolenUnwrap}
                useStolenUnwrap={
                  myPrize?.iWasStolenFrom &&
                  myPrize?.nft === ethers.constants.AddressZero
                }
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box style={{ marginTop: "4em", textAlign: "center" }}>
        <Typography variant="h6" style={{ fontWeight: "bold" }}>
          There shall-eth be order-eth
        </Typography>
        <Box style={{ margin: "2em" }}>
          <Table />
        </Box>
      </Box>
    </Box>
  );
};

export default MainFrame;

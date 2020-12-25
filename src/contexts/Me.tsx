import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { ethers } from "ethers";

import ContractsContext from "./Contracts";
import DappContext from "./Dapp";
import useInterval from "../hooks/Poller";
import { abis } from "../contracts";
// import { fetchIpfs } from "../api/ipfs";

type Prize = {
  nft: string;
  tokenId: number;
  iWasStolenFrom: boolean;
  media: Blob;
};

type PlayerInfo = {
  nft: string;
  tokenId: number;
  randomnessRequestId: string;
  stealerRequestId: string;
  hasTicket: boolean;
  wasStolenFrom: boolean;
  exists: boolean;
};

type MeContextT = {
  ticketPrice: number;
  prize: Prize;
  playerInfo: PlayerInfo;
  // isLoadingPrize: boolean;
  getTicketInfo: () => Promise<void>;
  getPrizeInfo: () => Promise<void>;
  enableCheckingPrize: () => void;
  shortcutFetchMedia: ({
    nftAddress,
    tokenId,
  }: {
    nftAddress: string;
    tokenId: string;
  }) => Promise<Blob>;
};

const defaultValue: MeContextT = {
  ticketPrice: -1,
  getTicketInfo: async () => {
    throw new Error("must be implemented");
  },
  prize: {
    nft: "",
    tokenId: -1,
    iWasStolenFrom: false,
    media: new Blob(),
  },
  playerInfo: {
    nft: "",
    tokenId: -1,
    randomnessRequestId: "",
    stealerRequestId: "",
    hasTicket: false,
    wasStolenFrom: false,
    exists: false,
  },
  // isLoadingPrize: false,
  getPrizeInfo: async () => {
    throw new Error("must be implemented");
  },
  enableCheckingPrize: () => {
    throw new Error("must be implemented");
  },
  shortcutFetchMedia: () => {
    throw new Error("must be implemented");
  },
};
const MeContext = createContext<MeContextT>(defaultValue);

export const MeContextProvider: React.FC = ({ children }) => {
  const { signer } = useContext(DappContext);
  const { whiteElephant } = useContext(ContractsContext);
  const [playerInfo, setPlayerInfo] = useState<MeContextT["playerInfo"]>(
    defaultValue.playerInfo
  );
  const [ticketPrice, setTicketPrice] = useState<number>(-1);
  const [prize, setPrize] = useState<MeContextT["prize"]>(defaultValue.prize);
  const [, setStartCheckingPrize] = useState<boolean>(false);

  // this function will only change if whiteElephant changes
  // this is required to avoid the recreation of the poller hook
  const getTicketInfo = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance");
      return;
    }
    const _playerInfo = await contract.getPlayerInfo(
      (await signer.getAddress()) || ethers.constants.AddressZero
    );
    setPlayerInfo(_playerInfo);
    const _price = await contract.ticketPrice();
    const price = ethers.utils.formatEther(_price);
    setTicketPrice(Number(price));
  }, [signer, whiteElephant]);

  // const fetchMedia = useCallback(
  //   async (_prize) => {
  //     if (!isIpfsReady || !signer) {
  //       console.debug("Ipfs not yet ready");
  //       return;
  //     }
  //     let blob;
  //     if (_prize.nft !== ethers.constants.AddressZero) {
  //       const nftContract = new ethers.Contract(
  //         _prize.nft,
  //         abis.erc721,
  //         signer
  //       );
  //       blob = await fetchIpfs({
  //         contract: nftContract,
  //         tokenId: _prize.tokenId,
  //         ipfs,
  //       });
  //     }
  //     return blob;
  //   },
  //   [ipfs, isIpfsReady, signer]
  // );

  const shortcutFetchMedia = useCallback(
    async ({ nftAddress, tokenId }) => {
      if (!tokenId || !nftAddress) {
        console.warn("attempting to fetch with no address or tokenId");
        return new Blob();
      }
      if (nftAddress === ethers.constants.AddressZero) {
        console.warn("attempting to fetch with zeroAddress");
        return new Blob();
      }
      const nftContract = new ethers.Contract(nftAddress, abis.erc721, signer);
      // todo: need to support uri as well
      console.debug("fetching tokenURI with", nftAddress, "and", tokenId);
      const tokenUri: string = await nftContract.tokenURI(tokenId);
      if (!tokenUri.startsWith("http")) {
        console.error("tokenUri does not start with http");
        return;
      }
      const meta = await (await fetch(tokenUri)).json();
      // for rarible minted NFTs, we can fetch from their ipfs node that is served over http
      // for others will add support as we go
      if (!("external_url" in meta)) {
        console.warn("not rarible minted NFT, probably won't fetch the image");
      }
      // image url
      let imageUrl: string;
      const _imageUrl = meta.image;
      if (_imageUrl.startsWith("ipfs://ipfs/")) {
        imageUrl = _imageUrl.substr("ipfs://ipfs/".length);
      } else if (_imageUrl.startsWith("http")) {
        // good chance this is an http image
        imageUrl = _imageUrl;
      }
      const baseUrl = `https://ipfs.rarible.com/ipfs/${imageUrl}`;
      const response = await fetch(baseUrl);
      const blob = await response.blob();
      return blob;
    },
    [signer]
  );

  const getPrizeInfo = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance, skipping");
      return;
    }
    // check if need to force starting to check the prize
    const { nft, tokenId: _tokenId } = await contract.getPlayerInfo(
      (await signer.getAddress()) || ethers.constants.AddressZero
    );
    let tokenId = Number(_tokenId);
    if (nft !== ethers.constants.AddressZero) {
      // force enable start checking the prize
      setStartCheckingPrize(true);
    } else {
      console.debug("not checking for the prize just yet");
      return;
    }
    if (nft === prize.nft && tokenId === prize.tokenId) {
      console.debug("same nft, skipping");
      return;
    }
    let iWasStolenFrom = await contract.myStolenFrom();
    // const blob = await fetchMedia({ nft: nftAddress, tokenId });
    const blob = await shortcutFetchMedia({ nft, tokenId });
    const _prize = {
      nft,
      tokenId,
      iWasStolenFrom,
      media: blob,
    };
    setPrize(_prize);
  }, [whiteElephant, signer, prize.nft, prize.tokenId, shortcutFetchMedia]);

  const enableCheckingPrize = () => {
    setStartCheckingPrize(true);
  };

  useInterval(getTicketInfo, 3_000);
  useInterval(getPrizeInfo, 3_000);

  // and fetch these for the first time immediately without waiting
  // for the poller
  useEffect(() => {
    getTicketInfo();
  }, [getTicketInfo]);

  return (
    <MeContext.Provider
      value={{
        playerInfo,
        ticketPrice,
        getTicketInfo,
        prize,
        enableCheckingPrize,
        getPrizeInfo,
        shortcutFetchMedia,
      }}
    >
      {children}
    </MeContext.Provider>
  );
};

export default MeContext;

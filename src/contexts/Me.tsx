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
import { fetchIpfs } from "../api/ipfs";

type Prize = {
  nft: string;
  tokenId: number;
  iWasStolenFrom: boolean;
  media: Blob;
};

type MeContextT = {
  ticketNum: number;
  ticketPrice: number;
  prize: Prize;
  isLoadingPrize: boolean;
  getTicketInfo: () => Promise<void>;
  getPrizeInfo: () => Promise<void>;
  enableCheckingPrize: () => void;
};

const defaultValue: MeContextT = {
  ticketNum: -1,
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
  isLoadingPrize: false,
  getPrizeInfo: async () => {
    throw new Error("must be implemented");
  },
  enableCheckingPrize: () => {
    throw new Error("must be implemented");
  },
};
const MeContext = createContext<MeContextT>(defaultValue);

export const MeContextProvider: React.FC = ({ children }) => {
  const { isIpfsReady, signer, ipfs } = useContext(DappContext);
  const { whiteElephant } = useContext(ContractsContext);
  const [ticketNum, setTicketNum] = useState<number>(-1);
  const [ticketPrice, setTicketPrice] = useState<number>(-1);
  const [prize, setPrize] = useState<MeContextT["prize"]>(defaultValue.prize);
  const [isLoadingPrize, setLoadingPrize] = useState<boolean>(false);
  const [startCheckingPrize, setStartCheckingPrize] = useState<boolean>(false);

  // this function will only change if whiteElephant changes
  // this is required to avoid the recreation of the poller hook
  const getTicketInfo = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance");
      return;
    }

    const orderNum = await contract.myOrderNum();
    const resolvedTicketNum = orderNum === 0 ? -1 : orderNum;
    setTicketNum(resolvedTicketNum);

    const _price = await contract.ticketPrice();
    const price = ethers.utils.formatEther(_price);
    setTicketPrice(Number(price));
  }, [whiteElephant]);

  const fetchMedia = useCallback(
    async (_prize) => {
      if (!isIpfsReady || !signer) {
        console.debug("Ipfs not yet ready");
        return;
      }
      let blob;
      if (_prize.nft !== ethers.constants.AddressZero) {
        const nftContract = new ethers.Contract(
          _prize.nft,
          abis.erc721,
          signer
        );
        blob = await fetchIpfs({
          contract: nftContract,
          tokenId: _prize.tokenId,
          ipfs,
        });
      }
      return blob;
    },
    [ipfs, isIpfsReady, signer]
  );

  const getPrizeInfo = useCallback(async () => {
    const { contract } = whiteElephant;
    if (!contract) {
      console.warn("no contract instance, skipping");
      return;
    }
    if (!startCheckingPrize) {
      console.debug("not checking for the prize just yet");
      return;
    }
    setLoadingPrize(true);
    const nftAddress = await contract.myNftAddress();
    let tokenId = Number(await contract.myTokenId());
    if (nftAddress === prize.nft && tokenId === prize.tokenId) {
      console.debug("same nft, skipping");
      return;
    }
    let iWasStolenFrom = await contract.myStolenFrom();
    const blob = await fetchMedia({ nft: nftAddress, tokenId });
    const _prize = {
      nft: nftAddress,
      tokenId,
      iWasStolenFrom,
      media: blob,
    };
    setPrize(_prize);
    setLoadingPrize(false);
  }, [fetchMedia, prize.nft, prize.tokenId, startCheckingPrize, whiteElephant]);

  const enableCheckingPrize = () => {
    setStartCheckingPrize(true);
  };

  useInterval(getTicketInfo, 30_000);
  useInterval(getPrizeInfo, 30_000);

  // and fetch these for the first time immediately without waiting
  // for the poller
  useEffect(() => {
    getTicketInfo();
  }, [getTicketInfo]);

  return (
    <MeContext.Provider
      value={{
        ticketNum,
        ticketPrice,
        getTicketInfo,
        prize,
        enableCheckingPrize,
        isLoadingPrize,
        getPrizeInfo,
      }}
    >
      {children}
    </MeContext.Provider>
  );
};

export default MeContext;

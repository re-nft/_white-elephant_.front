import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { ethers } from "ethers";

import ContractsContext from "./Contracts";
import useInterval from "../hooks/Poller";

type MeContextT = {
  ticketNum: number;
  ticketPrice: number;
  getTicketInfo: () => Promise<void>;
};

const defaultValue: MeContextT = {
  ticketNum: -1,
  ticketPrice: -1,
  getTicketInfo: async () => {
    throw new Error("must be implemented");
  },
};
const MeContext = createContext<MeContextT>(defaultValue);

export const MeContextProvider: React.FC = ({ children }) => {
  const { whiteElephant } = useContext(ContractsContext);
  const [ticketNum, setTicketNum] = useState<number>(-1);
  const [ticketPrice, setTicketPrice] = useState<number>(-1);

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

  useInterval(getTicketInfo, 30_000);

  // and fetch these for the first time immediately without waiting
  // for the poller
  useEffect(() => {
    getTicketInfo();
  }, [getTicketInfo]);

  return (
    <MeContext.Provider value={{ ticketNum, ticketPrice, getTicketInfo }}>
      {children}
    </MeContext.Provider>
  );
};

export default MeContext;

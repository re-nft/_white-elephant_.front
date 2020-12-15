import React, { createContext } from "react";
import { ethers } from "ethers";

type DappContextType = {
  wallet?: Wallet<"injected">;
  web3?: Web3;
  connectWallet: () => void;
  // addresses?: NetworkSpecificAddresses;
  // abis?: NetworkSpecificAbis;
};

const DefaultDappContext = {};

const DappContext = createContext<DappContextType>(DefaultDappContext);

export const DappContextProvider: React.FC = () => {
  return <></>;
};

export default DappContext;

import React, { createContext, useState } from "react";
import { ethers } from "ethers";

type DappContextType = {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.providers.JsonRpcSigner;
  connect: () => void;
  // addresses?: NetworkSpecificAddresses;
  // abis?: NetworkSpecificAbis;
};

const DefaultDappContext = {
  connect: () => {
    throw new Error("must be implemented");
  },
};

const DappContext = createContext<DappContextType>(DefaultDappContext);

export const DappContextProvider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();

  const connect = () => {
    //@ts-ignore
    if (!window?.ethereum) {
      console.warn("no ethereum in Window. Metamask is not installed?");
      return;
    }
    //@ts-ignore
    const _provider = new ethers.providers.Web3Provider(window?.ethereum);
    setProvider(_provider);

    const _signer = _provider.getSigner();
    setSigner(_signer);
  };

  return (
    <DappContext.Provider value={{ provider, connect, signer }}>
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;

import React, { createContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

type DappContextType = {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.providers.JsonRpcSigner;
  connect: () => void;
  address?: string;
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
  const [provider, setProvider] = useState<DappContextType["provider"]>();
  const [signer, setSigner] = useState<DappContextType["signer"]>();
  const [address, setAddress] = useState<DappContextType["address"]>();

  const getAddress = useCallback(async () => {
    if (!signer) return;
    const _address = await signer.getAddress();
    setAddress(_address);
  }, [signer]);

  const connect = () => {
    //@ts-ignore
    if (typeof window?.ethereum === "undefined") {
      console.log("MetaMask is not installed!");
    }

    try {
      //@ts-ignore
      window?.ethereum.enable();
    } catch (err) {
      console.error("could not establish connection with MetaMask");
      return;
    }

    //@ts-ignore
    const _provider = new ethers.providers.Web3Provider(window?.ethereum);
    setProvider(_provider);

    const _signer = _provider.getSigner();
    setSigner(_signer);
  };

  useEffect(() => {
    if (address) return;
    getAddress();
  }, [address, getAddress]);

  return (
    <DappContext.Provider value={{ provider, connect, signer, address }}>
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;

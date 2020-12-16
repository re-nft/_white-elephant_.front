import React, { createContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { addresses as _addresses } from "../contracts/index";

type addresses = {
  whiteElephant: string;
};

type DappContextType = {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.providers.JsonRpcSigner;
  connect: () => void;
  address?: string;
  network: string;
  addresses: addresses;
};

const DefaultDappContext = {
  connect: () => {
    throw new Error("must be implemented");
  },
  network: "",
  addresses: {
    whiteElephant: "",
  },
};

const DappContext = createContext<DappContextType>(DefaultDappContext);

export const DappContextProvider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<DappContextType["provider"]>();
  const [signer, setSigner] = useState<DappContextType["signer"]>();
  const [address, setAddress] = useState<DappContextType["address"]>();
  const [network, setNetwork] = useState<DappContextType["network"]>(
    DefaultDappContext.network
  );
  const [addresses, setAddresses] = useState<DappContextType["addresses"]>(
    DefaultDappContext.addresses
  );

  const getAddress = useCallback(async () => {
    if (!signer) return;
    const _address = await signer.getAddress();
    setAddress(_address);
  }, [signer]);

  const getNetwork = useCallback(async () => {
    if (!provider) return;
    const _network = await provider.detectNetwork();
    setNetwork(_network.name.toLowerCase());
  }, [provider]);

  const getAddresses = useCallback(async () => {
    if (!network) return;
    if (!(network === "homestead" || network === "goerli")) return;
    const whiteElephantAddr = _addresses[network].whiteElephant;
    setAddresses({ whiteElephant: whiteElephantAddr });
  }, [network]);

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
    getNetwork().then(() => getAddress());
  }, [address, getAddress, getNetwork, getAddresses]);

  return (
    <DappContext.Provider
      value={{ provider, connect, signer, address, addresses, network }}
    >
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;

import React, { createContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { addresses as _addresses, abis as _abis } from "../contracts/index";

type addresses = {
  whiteElephant: string;
};

type abis = {
  whiteElephant: any;
};

type DappContextType = {
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.providers.JsonRpcSigner;
  connect: () => void;
  address?: string;
  network: string;
  addresses: addresses;
  abis: abis;
};

const DefaultDappContext = {
  connect: () => {
    throw new Error("must be implemented");
  },
  network: "",
  addresses: {
    whiteElephant: "",
  },
  abis: {
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
  const [abis, setAbis] = useState<DappContextType["abis"]>(
    DefaultDappContext.abis
  );

  const getAddress = useCallback(async () => {
    if (!signer) return;
    const _address = await signer.getAddress();
    setAddress(_address);
  }, [signer]);

  const getNetwork = useCallback(async () => {
    if (!provider) {
      console.warn("can't identify the provider");
      return;
    }
    const _network = await provider.detectNetwork();
    let __network = _network.name.toLowerCase();
    if (
      !(
        __network === "homestead" ||
        __network === "goerli" ||
        __network === "unknown" ||
        __network === "hardhat"
      )
    ) {
      console.warn("invalid network.", __network);
    }
    __network = __network === "unknown" ? "hardhat" : "oops";
    setNetwork(__network);
  }, [provider]);

  const getAddressesAndAbis = useCallback(async () => {
    if (!network) {
      console.warn("can't identify the network");
      return;
    }
    // * unknown network can be hardhat in local dev env
    if (
      !(
        network === "homestead" ||
        network === "goerli" ||
        network === "hardhat"
      )
    ) {
      console.warn("invalid network", network);
      return;
    }

    const whiteElephantAddr = _addresses[network].whiteElephant;
    const whiteElephantAbi = _abis[network].whiteElephant;
    setAddresses({ whiteElephant: whiteElephantAddr });
    setAbis({ whiteElephant: whiteElephantAbi });
  }, [network]);

  const connect = useCallback(() => {
    //@ts-ignore
    if (typeof window?.ethereum === "undefined") {
      console.warn("MetaMask is not installed!");
      return;
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
  }, []);

  useEffect(() => {
    getAddress();
    getNetwork();
    getAddressesAndAbis();
  }, [getAddress, getNetwork, getAddressesAndAbis]);

  return (
    <DappContext.Provider
      value={{ provider, connect, signer, address, addresses, network, abis }}
    >
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;

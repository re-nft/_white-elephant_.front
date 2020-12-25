import React, { createContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

import { addresses as _addresses, abis as _abis } from "../contracts/index";
import useIpfsFactory from "../hooks/use-ipfs-factory";
import useIpfs from "../hooks/use-ipfs";
// import useInterval from "../hooks/Poller";

type addresses = {
  whiteElephant: string;
};

type abis = {
  whiteElephant: any;
};

type DappContextType = {
  ipfs?: any;
  isIpfsReady: boolean;
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
  isIpfsReady: false,
};

const DappContext = createContext<DappContextType>(DefaultDappContext);

export const DappContextProvider: React.FC = ({ children }) => {
  const { ipfs, isIpfsReady } = useIpfsFactory();
  useIpfs(ipfs, "id");
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
  // const [windowSelectedAccount, setSelectedAccount] = useState<string>("");

  const getAddress = useCallback(async () => {
    if (!signer) {
      console.debug("can't get own address");
      return;
    }
    const _address = await signer.getAddress();
    setAddress(_address);
  }, [signer]);

  const getNetwork = useCallback(async () => {
    if (!provider) {
      console.warn("can't identify the provider");
      return;
    }
    const _network = await provider.detectNetwork();
    console.debug(`network identified as ${_network.name}`);
    setNetwork(_network.name);
  }, [provider]);

  // * not tracking the network change
  const getAddressesAndAbis = useCallback(async () => {
    if (!network) {
      console.warn("can't identify the network");
      return;
    }
    const whiteElephantAddr = _addresses[network].whiteElephant;
    const whiteElephantAbi = _abis.whiteElephant;
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
      value={{
        ipfs,
        isIpfsReady,
        provider,
        connect,
        signer,
        address,
        addresses,
        network,
        abis,
      }}
    >
      {children}
    </DappContext.Provider>
  );
};

export default DappContext;

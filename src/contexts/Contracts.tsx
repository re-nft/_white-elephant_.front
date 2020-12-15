import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { ethers } from "ethers";

import DappContext from "./Dapp";
import { addresses, abis } from "../contracts";

type ContractsContextType = {
  whiteElephant: {
    contract?: ethers.Contract;
  };
};

const DefaultContractsContext = {
  whiteElephant: {},
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

export const ContractsContextProvider: React.FC = ({ children }) => {
  const { provider, signer } = useContext(DappContext);
  const [contract, setContract] = useState<ethers.Contract>();

  const getContract = useCallback(async () => {
    if (!provider || !signer) return null;
    const network = (await (
      await provider.detectNetwork()
    ).name.toLowerCase()) as "goerli" | "live";
    const _contract = new ethers.Contract(
      addresses[network].whiteElephant,
      abis[network].whiteElephant,
      signer
    );
    setContract(_contract);
  }, [provider, signer]);

  useEffect(() => {
    getContract();
  }, [getContract]);

  return (
    <ContractsContext.Provider value={{ whiteElephant: { contract } }}>
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;

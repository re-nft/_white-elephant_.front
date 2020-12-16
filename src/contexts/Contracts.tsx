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

type Optional<T> = T | undefined;
type Contract = ethers.Contract;
type Address = string;

type ContractsContextType = {
  whiteElephant: {
    contract?: ethers.Contract;
  };
  erc721: {
    contract: (at: string) => Optional<Contract>;
    approve: (at: string, operator: string, tokenId?: string) => void;
    isApproved: (
      at: string,
      operator: string,
      tokenId?: string
    ) => Promise<boolean>;
    tokenURI: (at: string, tokenId: string) => Promise<string>;
  };
};

const DefaultContractsContext = {
  whiteElephant: {},
  erc721: {
    contract: () => {
      throw new Error("must be implemented");
    },
    approve: () => {
      throw new Error("must be implemented");
    },
    isApproved: () => {
      throw new Error("must be implemented");
    },
    tokenURI: () => {
      throw new Error("must be implemented");
    },
  },
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

export const ContractsContextProvider: React.FC = ({ children }) => {
  const { provider, signer } = useContext(DappContext);
  const [contract, setContract] = useState<ethers.Contract>();
  const { erc721 } = abis;

  const getContract = useCallback(async () => {
    if (!provider || !signer) return null;
    const network = await (await provider.detectNetwork()).name.toLowerCase();
    if (!(network === "goerli" || network === "homestead")) return;
    const _contract = new ethers.Contract(
      addresses[network].whiteElephant,
      abis[network].whiteElephant,
      signer
    );
    setContract(_contract);
  }, [provider, signer]);

  const getContractErc721 = useCallback(
    (at: Address) => {
      if (!signer) return;
      const contract = new ethers.Contract(at, erc721, signer);
      return contract;
    },
    [signer, erc721]
  );

  const tokenURI = useCallback(
    async (at: Address, tokenId: string) => {
      const contract = getContractErc721(at);
      if (!contract) {
        console.info("could not get the contract");
        return "";
      }
      const uri: string = await contract.methods.tokenURI(tokenId).call();
      return uri;
    },
    [getContractErc721]
  );

  const approveErc721 = useCallback(
    async (at: Address, operator: Address, tokenId?: string) => {
      const contract = getContractErc721(at);
      if (!contract) {
        console.info("could not get erc721 contract");
        return;
      }

      if (tokenId) {
        await contract.approve(operator, tokenId);
      } else {
        await contract.approveAll(operator, true);
      }
    },
    [getContractErc721]
  );

  const _isApprovedErc721 = useCallback(
    async (contract: ethers.Contract, tokenId: string) => {
      if (!provider) return false;
      const account = await contract?.getApproved(tokenId);
      const network = await (
        await provider?.detectNetwork()
      )?.name.toLowerCase();
      if (!network) return false;
      if (!(network === "homestead" || network === "goerli")) return false;
      return (
        account.toLowerCase() ===
        addresses?.[network].whiteElephant.toLowerCase()
      );
    },
    [provider]
  );

  const isApprovedErc721 = useCallback(
    async (at: Address, operator: Address, tokenId?: string) => {
      const contract = getContractErc721(at);
      if (!contract) {
        console.info("could not get erc721 contract");
        return;
      }
      if (!signer) {
        console.info("signer is not ready");
        return;
      }

      let itIs = await contract.isApprovedForAll(
        await signer.getAddress(),
        operator
      );
      if (itIs) return true;
      if (!tokenId) return false;
      itIs = await _isApprovedErc721(contract, tokenId);
      return itIs;
    },
    [signer, getContractErc721, _isApprovedErc721]
  );

  useEffect(() => {
    getContract();
  }, [getContract]);

  return (
    <ContractsContext.Provider
      value={{
        whiteElephant: { contract },
        erc721: {
          contract: getContractErc721,
          approve: approveErc721,
          isApproved: isApprovedErc721,
          tokenURI,
        },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;

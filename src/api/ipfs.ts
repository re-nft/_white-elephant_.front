import { ethers } from "ethers";
import IPFS from "ipfs-core/src/components";
import toBuffer from "it-to-buffer";

type fetchArgs = {
  ipfs: IPFS;
  contract: ethers.Contract;
  tokenId: ethers.BigNumber | number;
};

export const fetch = async ({ ipfs, contract, tokenId }: fetchArgs) => {
  try {
    console.log(contract);
    const tokenUri: string = await contract.tokenURI(tokenId);
    // now fetch the meta from the ipfs
    if (!tokenUri.includes("ipfs")) {
      console.warn("token does not contain the ipfs url");
      console.warn(
        "give our developer monkeys these",
        contract.address,
        tokenId
      );
      return;
    }

    const meta = await ipfs.dag.get(tokenUri);
    // const meta = await toBuffer(await ipfs.get(tokenUri));
  } catch (err) {
    console.error(err);
    console.warn("could not fetch tokenUri");
    return;
  }
};

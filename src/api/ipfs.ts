import { ethers } from "ethers";
import toBuffer from "it-to-buffer";

type fetchArgs = {
  ipfs: any;
  contract: ethers.Contract;
  tokenId: ethers.BigNumber | number;
};

export const fetch = async ({ ipfs, contract, tokenId }: fetchArgs) => {
  try {
    // todo: some of them (most of them?) use uri function name... So need to extend the abi, and check both at the same time
    // only when both aren't returning anything should we hint the user to contact us
    const tokenUri: string = await contract.tokenURI(tokenId);
    // now fetch the meta from the ipfs
    if (!tokenUri.includes("ipfs/")) {
      console.warn("token does not contain the ipfs url");
      console.warn(
        `give our developer monkeys these\n--------------\naddr:${contract.address}\ntokenId:${tokenId}\n--------------`
      );
      return;
    }

    console.log(tokenUri);

    // if the file does not start with the ipfs prefix, then the meta is a simple json file
    // else pull the ipfs and look for image in there

    // todo: ipfs utils must have something on this
    const startIx = tokenUri.indexOf("ipfs/");
    const resolvedIpfsUri = tokenUri.substr(startIx + 5, tokenUri.length);

    console.log(resolvedIpfsUri);

    console.log(await ipfs.id());

    console.log(
      "pulling",
      "ipfs://ipfs/QmREKWm51YhKNyRnwLRUY5VpK3Fxwh14T5x8HNKdpfdQhs/image.png"
    );

    const meta = await toBuffer(
      ipfs.cat("QmREKWm51YhKNyRnwLRUY5VpK3Fxwh14T5x8HNKdpfdQhs/image.png")
    );

    console.log("meta inside", meta);

    const blob = new Blob([meta.buffer], { type: "image/png" } /* (1) */);

    console.log("blob", blob);

    return blob;
    // const meta = await toBuffer(await ipfs.get(tokenUri));
  } catch (err) {
    console.error(err);
    console.warn("could not fetch tokenUri");
    return;
  }
};

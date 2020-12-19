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

    console.log("tokenUri", tokenUri);

    // if the file does not start with the ipfs prefix, then the meta is a simple json file
    // else pull the ipfs and look for image in there

    // if starts with https can obviously use axios for that
    // todo: also rename this
    // todo: ipfs utils must have something on this
    const startIx = tokenUri.indexOf("ipfs/");
    const resolvedIpfsUri = tokenUri.substr(startIx + 5, tokenUri.length);

    // console.log("pull this", resolvedIpfsUri);
    // console.log(await ipfs.id());
    // console.log(
    //   "pulling",
    //   "ipfs://ipfs/QmREKWm51YhKNyRnwLRUY5VpK3Fxwh14T5x8HNKdpfdQhs/image.png"
    // );

    const meta = await toBuffer(ipfs.cat(resolvedIpfsUri));

    const imgBufferUrl = JSON.parse(meta.toString()).image;
    const resolvedImgBufferUrl = imgBufferUrl.substr(
      imgBufferUrl.indexOf("Qm"),
      imgBufferUrl.length
    );
    console.log("imgUrl", resolvedImgBufferUrl);

    const imgBuffer = await toBuffer(ipfs.get(resolvedImgBufferUrl));

    console.log("imgBuffer keys", Object.keys(imgBuffer));

    // console.log(meta.toString());
    console.log(meta.toJSON());
    // console.log("meta inside", meta);

    const blob = new Blob([imgBuffer.buffer], { type: "image/png" } /* (1) */);

    // console.log("blob", blob);

    return blob;
    // const meta = await toBuffer(await ipfs.get(tokenUri));
  } catch (err) {
    console.error(err);
    return;
  }
};

import { ethers } from "ethers";
// import toBuffer from "it-to-buffer";

type fetchArgs = {
  ipfs: any;
  contract: ethers.Contract;
  tokenId: ethers.BigNumber | number;
};

const debug = (verbose: boolean, ...args) => {
  if (verbose) console.debug(...args);
};

const IPFS_PREFIX = "ipfs://";

const resolveMedia = async (ipfs: any, url: string) => {
  debug(true, "resolved media url", url);
  if (url.startsWith(IPFS_PREFIX))
    url = url.substr(IPFS_PREFIX.length, url.length);
  let ipfsFile;
  let stream = ipfs.get(url);
  debug(true, "media cid stream", stream);
  // * there is an it to get first
  let ix = 0;
  for await (const buf of stream) {
    if (ix > 0) console.warn("more than one file");
    debug(true, "cid", buf);
    ipfsFile = buf;
    ix++;
  }
  const imgBuffer = [];
  stream = ipfsFile.content;
  debug(true, "stream", stream);
  for await (const buf of stream) {
    imgBuffer.push(buf);
  }
  debug(true, imgBuffer);
  //@ts-ignore
  const blob = new Blob(imgBuffer);
  debug(true, blob);
  return blob;
};

// todo: this is pain. REFACTOR. worst code I have written in a while
export const fetchIpfs = async ({ contract, tokenId, ipfs }: fetchArgs) => {
  // todo: some of them (most of them?) use uri function name... So need to extend the abi, and check both at the same time
  // only when both aren't returning anything should we hint the user to contact us
  const tokenUri: string = await contract.tokenURI(tokenId);
  let meta: any;
  // if the tokenUri starts with https, then we can fetch the JSON
  if (tokenUri.startsWith("http")) {
    meta = await (await fetch(tokenUri)).json();
  }
  if (tokenUri.startsWith("ipfs")) {
    const blob = await resolveMedia(ipfs, tokenUri);
    return blob;
  }
  debug(true, "tokenUri", tokenUri);
  if ("image" in meta) {
    debug(true, "image url", meta.image);
    // pulling the image from ipfs
    if (!meta.image.startsWith("ipfs")) {
      console.warn("token does not contain the ipfs url");
      console.warn(
        `give our developer monkeys these\n--------------\naddr:${contract.address}\ntokenId:${tokenId}\n--------------`
      );
      return;
    }
    debug(true, "meta", meta);
    const resolvedImageUrl = meta.image.substr(
      meta.image.lastIndexOf("ipfs/") + 5,
      meta.image.length
    );
    const blob = resolveMedia(ipfs, resolvedImageUrl);
    return blob;
  }
  return null;
};

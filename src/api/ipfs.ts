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

const resolveMedia = async (ipfs: any, url: string) => {
  debug(true, "resolvedImageUrl", url);

  if (url.startsWith("ipfs://")) {
    url = url.substr(7, url.length);
  }

  let ipfsFile;
  let stream = ipfs.get(url);

  debug(true, "stream", stream);

  // todo: there is an it to get first
  let ix = 0;
  for await (const buf of stream) {
    if (ix > 0) {
      console.warn("more than one file");
    }
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
export const fetchIpfs = async ({ ipfs, contract, tokenId }: fetchArgs) => {
  try {
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
  } catch (err) {
    console.warn("could not fetch the ipfs meta");
    console.warn(err);
    return;
  }
};

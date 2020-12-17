import whiteElephant from "./abis/WhiteElephant.json";
import erc721 from "./abis/IERC721.json";

const abis = {
  localhost: {
    whiteElephant: whiteElephant.abi,
  },
  hardhat: {
    whiteElephant: whiteElephant.abi,
  },
  goerli: {
    whiteElephant: whiteElephant.abi,
  },
  homestead: {
    whiteElephant: whiteElephant.abi,
  },
  erc721: erc721.abi,
};

export default abis;

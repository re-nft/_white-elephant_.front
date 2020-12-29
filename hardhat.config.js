require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan"); /// to verify the contracts
require("hardhat-spdx-license-identifier"); // to automatically prepand the spdx license field
require("hardhat-typechain");
const fs = require("fs");

const defaultNetwork = "localhost";

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("write-abis", "Writes the abis", async (taskArgs, hre, runSuper) => {
  const data = fs.readFileSync(
    "./artifacts/contracts/WhiteElephant.sol/WhiteElephant.json"
  );
  const nftData = fs.readFileSync(
    "./artifacts/contracts/mocks/NFT.sol/Nft.json"
  );
  fs.writeFileSync("./src/contracts/abis/WhiteElephant.json", data);
  fs.writeFileSync("./src/contracts/abis/IERC721.json", nftData);
  console.log("Wrote WhiteElephant.json artifact");
  console.log("Wrote NFT.json artifact");
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork,
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  typechain: {
    outDir: "src/typechain",
    target: "ethers-v5",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://localhost:8545",
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad",
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad",
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad",
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic:
          "spoon mouse pupil sail verify message seat cross setup stumble park dentist",
      },
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic:
          "spoon mouse pupil sail verify message seat cross setup stumble park dentist",
      },
    },
    xdai: {
      url: "https://dai.poa.network",
      gasPrice: 1000000000,
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

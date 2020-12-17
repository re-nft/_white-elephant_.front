require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const { config, ethers, task } = require("hardhat/config");

const defaultNetwork = "localhost";
const WRITE_PATH = "./src/contracts/addresses.ts";
const addressesTemplate = ({ hardhat = "", goerli = "", homestead = "" }) => {
  return `const addresses = {
  hardhat: {
    whiteElephant: "${hardhat}",
  },
  goerli: {
    whiteElephant: "${goerli}",
  },
  homestead: {
    whiteElephant: "${homestead}",
  },
};
export default addresses;`;
};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// this task will write the addresses of the contracts to src/contracts/addresses.ts
task(
  "update-addresses",
  "Updates the contracts/addresses",
  async (taskArguments, hre, runSuper) => {
    const WhiteElephant = await ethers.getContractFactory("WhiteElephant");
    const whiteElephant = await WhiteElephant.deploy();

    const addresses = addressesTemplate({
      [hre.network.name]: whiteElephant.address,
    });

    fs.writeFileSync(WRITE_PATH, addresses);
  }
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork,
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
      url: "https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad", //<---- YOUR INFURA ID! (or it won't work)
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad", //<---- YOUR INFURA ID! (or it won't work)
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad", //<---- YOUR INFURA ID! (or it won't work)
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    goerli: {
      url: "https://goerli.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad", //<---- YOUR INFURA ID! (or it won't work)
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
    xdai: {
      url: "https://dai.poa.network",
      gasPrice: 1000000000,
      // accounts: {
      //   mnemonic: mnemonic(),
      // },
    },
  },
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

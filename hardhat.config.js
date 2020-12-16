require("@nomiclabs/hardhat-waffle");
const fs = require("fs");

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
    console.log("taskArguments are", taskArguments);
    console.log("hre", hre);
    console.log("runSuper", runSuper);

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
  solidity: "0.7.5",
};

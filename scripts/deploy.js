const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const WRITE_PATH = path.join(
  path.dirname(__dirname),
  "src",
  "contracts",
  "addresses.ts"
);

const addressesTemplate = ({
  localhost = "",
  hardhat = "",
  goerli = "",
  homestead = "",
}) => {
  return `const addresses = {
  localhost: {
    whiteElephant: "${localhost}",
  },
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

async function main() {
  const allSigners = await ethers.getSigners();
  const deployer = allSigners[0];

  console.log("Deploying from", deployer.address);

  // We get the contract to deploy
  const WhiteElephant = await ethers.getContractFactory("WhiteElephant");
  const whiteElephant = await WhiteElephant.deploy();

  const Nft = await ethers.getContractFactory("Nft");
  const nft = await Nft.deploy();

  console.log("Awarding the dummy NFTs, you are welcome...");
  for (let i = 0; i < 10; i++) {
    await nft.awardNft(allSigners[0].address);
  }

  await nft.setApprovalForAll(whiteElephant.address, true);

  for (let i = 0; i < 10; i++) {
    await whiteElephant.depositNft(nft.address, i + 1);
  }

  console.log("Nft deployed to:", nft.address);
  console.log("WhiteElephant deployed to:", whiteElephant.address);

  // for convenience purely
  const allAddresses = JSON.stringify({
    whiteElephant: whiteElephant.address,
    nft: nft.address,
  });
  fs.writeFileSync("./all.addresses", allAddresses);
  // ----

  console.log("Writing the addresses of the deployed contracts...");
  const data = addressesTemplate({ [network.name]: whiteElephant.address });
  fs.writeFileSync(WRITE_PATH, data);
  console.log("Success!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

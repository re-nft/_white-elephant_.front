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

  for (let i = 0; i < 10; i++) {
    console.log(
      `Awarding the NFTs, tokenId: ${i + 1} to ${
        allSigners[0].address
      }, you are welcome...`
    );
    const tx = await nft.awardNft(allSigners[0].address);
    // const receipt = await tx.wait(1);
    // console.log("Receipt", receipt);
  }

  console.log("Approving the white elephant contract");
  await nft.setApprovalForAll(whiteElephant.address, true);

  for (let i = 0; i < 10; i++) {
    // console.log(`Owner of tokenId: ${i + 1} is ${await nft.ownerOf(i + 1)}`);
    console.log(`Depositing the NFTs into the contract now, tokenId: ${i + 1}`);
    try {
      await whiteElephant.depositNft(nft.address, i + 1, {
        gasLimit: 5_000_000,
      });
    } catch (err) {
      console.warn("unpredictable gas probably...");
    }
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

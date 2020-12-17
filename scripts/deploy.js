const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const WhiteElephant = await ethers.getContractFactory("WhiteElephant");
  const whiteElephant = await WhiteElephant.deploy();

  const Nft = await ethers.getContractFactory("Nft");
  const nft = await Nft.deploy();

  for (let i = 0; i < 5; i++) {
    await nft.awardNft();
  }

  console.log("Nft deployed to:", nft.address);
  console.log("WhiteElephant deployed to:", whiteElephant.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

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

  // from not necessary here, but good to show how it is done for the
  // future reference
  // const allSigners = await ethers.getSigners();
  // await nft.setApprovalForAll(whiteElephant.address, true);

  // const owner = await nft.ownerOf(0);
  // console.log("owner", owner);

  // Counters.Counter starts from 1, thus i + 1
  // for (let i = 0; i < 5; i++) {
  //   const tx = await whiteElephant.depositNft(nft.address, i + 1);
  //   await tx.wait();
  // }

  // * to send from other accounts, need to instantiate with a different signer
  // const ticketPrice = await whiteElephant.ticketPrice();
  // now buy the ticket for the first 5
  // for (let i = 0; i < 5; i++) {
  //   tx = await whiteElephant.buyTicket({
  //     from: allSigners[i].address,
  //     value: ticketPrice,
  //   });
  //   await tx.wait();
  // }

  console.log("Nft deployed to:", nft.address);
  console.log("WhiteElephant deployed to:", whiteElephant.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

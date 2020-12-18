const { ethers } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  const a = "0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8";
  const abi = require("../src/contracts/abis/WhiteElephant.json").abi;
  const whiteElephant = new ethers.Contract(a, abi, signers[0]);

  await whiteElephant.endEvent();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

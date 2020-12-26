const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const WRITE_PATH = path.join(
  path.dirname(__dirname),
  "src",
  "contracts",
  "addresses.ts"
);

// useLess - pan intended - pun intended 2x there!
const addressesTemplate = ({
  localhost = "",
  hardhat = "",
  goerli = "",
  homestead = "",
  kovan = "",
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
  kovan: {
    whiteElephant: "${kovan}",
  }
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

  let tx;
  console.log("Batch awarding the NFTs");
  tx = await nft.batchAwardNft(allSigners[0].address, 10);
  await tx.wait(1);

  // * to check that whitelisted depositors is working correctly
  tx = await nft.awardNft("0x50c3374fd62dd09f18ccc01e1c20f5de66cd6dea");
  await tx.wait(1);

  console.log("Approving the white elephant contract");
  await nft.setApprovalForAll(whiteElephant.address, true);
  console.log("Whitelisting the current deployer for deposits");
  await whiteElephant.addWhitelistedDepositors([allSigners[0].address]);

  console.log("Batch depositing the NFTs to the white elephant contract");
  tx = await whiteElephant.batchDepositNft(
    [...Array(10).fill(nft.address)],
    [...Array(10).keys()].map((v) => v + 1),
    { gasLimit: 5_000_000 }
  );
  await tx.wait(1);

  console.log("Finally sending some LINK to the white elephant");
  // straight outta https://docs.ethers.io/v5/api/contract/example/
  // A Human-Readable ABI; any supported ABI format could be used
  const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (boolean)",
    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  // This can be an address or an ENS name
  // const address = "dai.tokens.ethers.eth";
  const kovanLinkAddress = "0xa36085f69e2889c224210f603d836748e7dc0088";
  const link = await new ethers.Contract(kovanLinkAddress, abi, allSigners[0]);
  await link.transfer(
    whiteElephant.address,
    ethers.utils.parseEther("2").toString()
  );

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

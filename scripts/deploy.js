async function main() {
  // We get the contract to deploy
  const WhiteElephant = await ethers.getContractFactory("WhiteElephant");
  const whiteElephant = await WhiteElephant.deploy();

  console.log("WhiteElephant deployed to:", whiteElephant.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

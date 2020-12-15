const WhiteElephant = artifacts.require("WhiteElephant");
const Nft = artifacts.require("Nft");

module.exports = async (_deployer, _network) => {
  if (_network === "development" || _network === "goerli") {
    // Use deployer to state migration tasks.
    await _deployer.deploy(WhiteElephant);

    const nft = await Nft.deployed();

    await nft.awardNft();
    await nft.awardNft();
    await nft.awardNft();
    await nft.awardNft();
    await nft.awardNft();
  }
};

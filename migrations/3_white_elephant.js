const Nft = artifacts.require("NFT");
const WhiteElephant = artifacts.require("WhiteElephant");

module.exports = async (_deployer, _network) {
  if (_network === "development" || _network === "goerli") {
    // Use deployer to state migration tasks.
    const nft = await Nft.deployed();
    const white = _deployer.deploy(WhiteElephant);

    await nft.awardNft();
    await nft.awardNft();
    await nft.awardNft();

    // todo: batch deposit for gas savings?
    white.depositNft(nft.address, "0");
    white.depositNft(nft.address, "1");
    white.depositNft(nft.address, "2");
  }
};
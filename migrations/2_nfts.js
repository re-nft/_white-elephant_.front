const Nft = artifacts.require("NFT");

module.exports = function (_deployer, _network) {
  if (_network === "development" || _network === "goerli") {
    // Use deployer to state migration tasks.
    _deployer.deploy(Nft);
  }
};
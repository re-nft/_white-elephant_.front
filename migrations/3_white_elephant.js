const WhiteElephant = artifacts.require("WhiteElephant");

module.exports = async (_deployer, _network) => {
  if (_network === "development" || _network === "goerli") {
    // Use deployer to state migration tasks.
    await _deployer.deploy(WhiteElephant);
  }
};

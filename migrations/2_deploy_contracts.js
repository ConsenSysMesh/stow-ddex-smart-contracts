const LinniaOffers = artifacts.require('./LinniaOffers.sol');

module.exports = (deployer, network, accounts) => {
  return deployer.deploy(LinniaOffers);
};
const LinniaOffers = artifacts.require('./LinniaOffers.sol');

const hubAddress = '';
const tokenAddress = '';

module.exports = (deployer, network, accounts) => {
  return deployer.deploy(LinniaOffers, tokenAddress, hubAddress);
};

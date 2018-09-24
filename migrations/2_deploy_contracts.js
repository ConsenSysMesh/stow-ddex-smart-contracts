const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');

const hubAddress = '';
const tokenAddress = '';

module.exports = (deployer, network, accounts) => {
  return deployer.deploy(LinniaStaking, tokenAddress, hubAddress)
    .then((staking) => {
      return deployer.deploy(LinniaOffers, tokenAddress, hubAddress, staking.address);
    });
};
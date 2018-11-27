const StowOffers = artifacts.require('./StowOffers.sol');
const StowStaking = artifacts.require('./StowStaking.sol');
const StowDDEXHub = artifacts.require('./StowDDEXHub.sol');

const addresses = require('@stowprotocol/stow-addresses');

const getContractAddresses = network => {
  const contracts = addresses[network];

  return {
    hubAddress: contracts ? contracts.StowSmartContracts.latest : '',
    tokenAddress: contracts ? contracts.StowToken.latest : '',
  };
};

module.exports = (deployer, network, accounts) => {
	let ddexHubInstance;

  const { hubAddress, tokenAddress } = getContractAddresses(network);
	// deploy ddexHub
	return deployer.deploy(StowDDEXHub, hubAddress, tokenAddress)
	 .then((_ddexHubInstance) => {
	   ddexHubInstance = _ddexHubInstance;
	  // deploy staking
  	   return deployer.deploy(StowStaking, ddexHubInstance.address);
     }).then(() => {
     	// deploy offers
       return deployer.deploy(StowOffers, ddexHubInstance.address);
     }).then(() => {
         // set all the addresses in the ddexhub
       return ddexHubInstance.setOffersContract(StowOffers.address);
     }).then(() => {
       return ddexHubInstance.setStakingContract(StowStaking.address);
     })
};

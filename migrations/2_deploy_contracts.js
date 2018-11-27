const StowOffers = artifacts.require('./StowOffers.sol');
const StowStaking = artifacts.require('./StowStaking.sol');
const StowDDEXHub = artifacts.require('./StowDDEXHub.sol');

const { ropsten } = require('@stowprotocol/stow-addresses');
const { StowSmartContracts, StowToken } = ropsten;

const hubAddress = '' || StowSmartContracts.latest;
const tokenAddress = '' || StowToken.latest;

module.exports = (deployer, network, accounts) => {
	let ddexHubInstance;
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

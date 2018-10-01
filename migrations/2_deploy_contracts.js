const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');
const LinniaDDEXHub = artifacts.require('./LinniaDDEXHub.sol');

const hubAddress = '0x76305411D861ecc48153336BE8b8c255e1aEc823';
const tokenAddress = '0x4cdfbdec0aa003116bf030f249a8a7285cd6a184';

module.exports = (deployer, network, accounts) => {
	let ddexHubInstance;
	// deploy ddexHub
	return deployer.deploy(LinniaDDEXHub, hubAddress, tokenAddress)
	 .then((_ddexHubInstance) => {
	   ddexHubInstance = _ddexHubInstance;
	  // deploy staking
  	   return deployer.deploy(LinniaStaking, ddexHubInstance.address);
     }).then(() => {
     	// deploy offers
       return deployer.deploy(LinniaOffers, ddexHubInstance.address);
     }).then(() => {
         // set all the addresses in the ddexhub
       return ddexHubInstance.setOffersContract(LinniaOffers.address);
     }).then(() => {
       return ddexHubInstance.setStakingContract(LinniaStaking.address);
     })
};
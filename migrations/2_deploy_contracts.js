const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');
const LinniaDDEXHub = artifacts.require('./LinniaDDEXHub.sol');

const hubAddress = '0x177bf15e7e703f4980b7ef75a58dc4198f0f1172';
const tokenAddress = '0x4cdfbdec0aa003116bf030f249a8a7285cd6a184';

module.exports = (deployer, network, accounts) => {
	let ddexHubInstance;
	// deploy ddexHub
	return deployer.deploy(LinniaDDEXHub)
	 .then((_ddexHubInstance) => {
	   ddexHubInstance = _ddexHubInstance;
	  // deploy staking
  	   return deployer.deploy(LinniaStaking, tokenAddress, hubAddress, ddexHubInstance.address)
     }).then((staking) => {
     	// deploy offers
       return deployer.deploy(LinniaOffers, tokenAddress, hubAddress, staking.address, ddexHubInstance.address);
     }).then(() => {
         // set all the addresses in the ddexhub
       return ddexHubInstance.setOffersContract(LinniaOffers.address)
     }).then(() => {
       return ddexHubInstance.setStakingContract(LinniaStaking.address)
     })
};
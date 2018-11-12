const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');
const LinniaDDEXHub = artifacts.require('./LinniaDDEXHub.sol');

const hubAddress = '0xe2e971fa9a1ace5af8080c7b447339e147926474';
const tokenAddress = '0x4d7d894b9fe6a113472bcc98edc1db4c9a101cb4';

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
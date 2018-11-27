const STOWToken = require('@stowprotocol/stow-token-contracts/build/contracts/STOWToken');
const StowHub = require('@stowprotocol/stow-smart-contracts/build/contracts/StowHub');
const StowRecords = require('@stowprotocol/stow-smart-contracts/build/contracts/StowRecords');
const StowPermissions = require('@stowprotocol/stow-smart-contracts/build/contracts/StowPermissions');
const Offers = require('../build/contracts/StowOffers');
const Staking = require('../build/contracts/StowStaking');
const Hub = require('../build/contracts/StowDDEXHub');
const { getContract } = require('./contract');

const getDDexContracts = async (address) => {
  const hub = getContract(Hub, address);
  const stakingAddress = await hub.stakingContract();
  const offersAddress = await hub.offersContract();
  const tokenAddress = await hub.tokenContract();
  const stowHubAddress = await hub.hubContract();
  const stowHub = getContract(StowHub, stowHubAddress);
  const recordsAddress = await StowHub.recordsContract();
  const records = getContract(StowRecords, recordsAddress);
  const permissionsAddress = await stowHub.permissionsContract();
  const permissions = getContract(StowPermissions, permissionsAddress);
  const staking = getContract(Staking, stakingAddress);
  const offers = getContract(Offers, offersAddress);
  const token = getContract(STOWToken, tokenAddress);

  return {
    records,
    staking,
    offers,
    token,
    hub,
    permissions
  };
};


module.exports = {getDDexContracts};

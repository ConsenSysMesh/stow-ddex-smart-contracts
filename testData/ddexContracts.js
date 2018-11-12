const Hub = require('../build/contracts/LinniaDDEXHub');
const Staking = require('../build/contracts/LinniaStaking');
const Offers = require('../build/contracts/LinniaOffers');
const LINToken = require('@linniaprotocol/linnia-token-contracts/build/contracts/LINToken');
const LinniaHub = require("@linniaprotocol/linnia-smart-contracts/build/contracts/LinniaHub");
const LinniaRecords = require("@linniaprotocol/linnia-smart-contracts/build/contracts/LinniaRecords");
const LinniaPermissions = require("@linniaprotocol/linnia-smart-contracts/build/contracts/LinniaPermissions");
const { getContract } = require('./contract');

const getDDexContracts = async (address) => {
  const hub = getContract(Hub, address);
  const stakingAddress = await hub.stakingContract();
  const offersAddress = await hub.offersContract();
  const tokenAddress = await hub.tokenContract();
  const linniaHubAddress = await hub.hubContract();
  const linniaHub = getContract(LinniaHub, linniaHubAddress);
  const recordsAddress = await linniaHub.recordsContract();
  const records = getContract(LinniaRecords, recordsAddress);
  const permissionsAddress = await linniaHub.permissionsContract();
  const permissions = getContract(LinniaPermissions, permissionsAddress);
  const staking = getContract(Staking, stakingAddress);
  const offers = getContract(Offers, offersAddress);
  const token = getContract(LINToken, tokenAddress);

  return {
    records,
    staking,
    offers,
    token,
    hub,
    permissions
  };
};


module.exports = {getDDexContracts}
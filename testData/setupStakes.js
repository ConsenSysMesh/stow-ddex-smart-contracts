const {getAccounts} = require('./utils');

const setupStakes = async (utils) => {
  const accounts = await getAccounts();
  const seedAmount = 10 ** 20;
  const {staking, events, token} = utils;
  console.log('staking accounts');
  for(let i=1; i<accounts.length; i++){
    try{
      const stakeAmountBN = await staking.stakeAmount();
  	  const stakeAmount = stakeAmountBN.toNumber();
  	  await token.transfer(accounts[i], seedAmount, {from: accounts[0], gas: 500000, gasPrice: 1});
      await token.approve(staking.address, stakeAmount, {from: accounts[i], gas: 500000});
      await staking.makeStake({ from: accounts[i], gas: 500000, gasPrice: 1});
    }
    catch(e){console.log(e);}
  }
  console.log('all accounts staked!');
};

module.exports = {setupStakes};

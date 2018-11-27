const {getAccounts} = require('./utils');

const setupStakes = async (utils) => {
  const accounts = await getAccounts();
  const seedAmount = 10 ** 20;
  const {staking, events, token} = utils;
  console.log('staking accounts');
  const stakePromises = accounts.map(async (account,i) => {
    if(i>0){
      try{
        const stakeAmountBN = await staking.stakeAmount();
  	    const stakeAmount = stakeAmountBN.toNumber();
  	    return token.approve(staking.address, stakeAmount, {from: accounts[i].toLowerCase(), gas: 500000}).then(() => {
          staking.makeStake({ from: accounts[i].toLowerCase(), gas: 500000, gasPrice: 1});
        });
      }
      catch(e){console.log(e);}
    }
  });
  await Promise.all(stakePromises);
  console.log('all accounts staked!');
};

module.exports = {setupStakes};
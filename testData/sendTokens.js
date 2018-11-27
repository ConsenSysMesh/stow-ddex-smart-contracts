const {getAccounts} = require('./utils');

const sendTokens = async (utils) => {
  const accounts = await getAccounts();
  const seedAmount = 10 ** 20;
  const {token} = utils;
  console.log('checking token balances');
  const tokenPromises = accounts.map(async (account,i) => {
   	if(i>0){
      const balance = await token.balanceOf(accounts[i]);
      if(balance.c[0] === 0){
        try{
          console.log(`sending LIN to ${accounts[i]}`);
  	     return token.transfer(accounts[i].toLowerCase(), seedAmount, {from: accounts[0].toLowerCase(), gas: 500000 });
        }
        catch(e){
          console.log(e);
        }
      }
    }
  });
  await Promise.all(tokenPromises);
  console.log('all accounts have LIN!');
};

module.exports = {sendTokens};
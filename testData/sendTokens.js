const {getAccounts} = require('./utils');

const sendTokens = async (utils) => {
  const accounts = await getAccounts();
  const seedAmount = 10 ** 20;
  const {token} = utils;
  console.log('checking token balances');
  for (let i = 0; i < accounts.length; i++) {
    if(i > 0) {
      const balance = await token.balanceOf(accounts[i]);
      console.log(balance.c[0], accounts[i]);
      if(balance.c[0] === 0){
        try{
          console.log(`sending STOW to ${accounts[i]}`);
          await token.transfer(accounts[i].toLowerCase(), seedAmount, {from: accounts[0].toLowerCase(), gas: 500000 });
        }
        catch(e){
          console.log(e);
        }
      }
  }
}

  console.log('all accounts have STOW!');
};

module.exports = {sendTokens};

const {web3} = require('./config');

const getAccounts = async () => {
  const accounts =  await web3.eth.getAccounts();
  return accounts;
};

module.exports = {getAccounts};
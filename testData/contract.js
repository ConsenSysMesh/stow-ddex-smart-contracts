const TruffleContract = require('truffle-contract');
const {web3} = require('./config')

const truffleHack = (contract) => {
  if (typeof contract.currentProvider.sendAsync !== 'function') {
    contract.currentProvider.sendAsync = function () {
      return contract.currentProvider.send.apply(contract.currentProvider, arguments);
    };
  }
  return contract;
};

const getContract = (abi, address) => {
  let Contract = TruffleContract(abi);
  Contract.setProvider(web3.currentProvider);
  Contract = truffleHack(Contract);
  const contract = Contract.at(address);
  return contract;
};

module.exports={getContract}


require('dotenv').load();
const Web3 = require('web3');

const providerHost = process.env.LINNIA_ETH_PROVIDER;

const HDWalletProvider = require('truffle-hdwallet-provider');

let privKeys;

// If ropsten, set the owner private key
if (providerHost === 'ropsten') {
  privKeys = require('../test-private-keys').private_keys;
  privKeys[0] = process.env.LINNIA_ETH_INFURA_ROPSTEN_HUB_OWNER_PRIVATE_KEY;
}

// If rinkeby, set the owner private key
if (providerHost === 'rinkeby') {
  privKeys = require('../test-private-keys').private_keys;
  privKeys[0] = process.env.LINNIA_ETH_INFURA_RINKEBY_HUB_OWNER_PRIVATE_KEY;
}

const networks = {
  ropsten: {
    provider() {
      return new HDWalletProvider(
        privKeys,
        `https://ropsten.infura.io/${process.env.LINNIA_ETH_INFURA_KEY}`,
      );
    },
    network_id: 3,
  },
  rinkeby: {
    provider() {
      return new HDWalletProvider(
        privKeys,
        `https://rinkeby.infura.io/${process.env.LINNIA_ETH_INFURA_KEY}`,
      );
    },
    network_id: 4,
  },
};

let web3;

// If ropsten or rinkeby
if (providerHost === 'ropsten' || providerHost === 'rinkeby') {
  const provider = networks[providerHost].provider();
  web3 = new Web3(provider.engine);
}
else{
  web3 = new Web3('http://localhost:7545');
}


module.exports = {
  web3
};

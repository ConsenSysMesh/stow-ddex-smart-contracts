const HDWalletProvider = require("truffle-hdwallet-provider-privkey");

var infura_apikey = "INFURA API KEY HERE";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider("PRIVATE KEY HERE", "https://ropsten.infura.io/"+infura_apikey),
      from: "OWNER ADDRESS HERE",
      network_id: 4,
    }
  }
};
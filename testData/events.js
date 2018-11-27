const {web3} = require('./config');

// Hacks to make event watching work without totally refactoring library
const fixWatch = (event, name, contract) => {
  const web3Contract = new web3.eth.Contract(contract.abi, contract.address);

  event.watch = (callback) => {
    web3Contract.events[name]().on('data', callback);
  };

  return event;
};

const getPastEvents = (event) => new Promise((resolve, reject) => event({}, {
  fromBlock: 0,
  toBlock: 'latest'
}).get((err, events) => {
  err ? reject(err) : resolve(events);
}));

module.exports={fixWatch, getPastEvents};
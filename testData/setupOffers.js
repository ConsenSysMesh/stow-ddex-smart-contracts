const {getAccounts} = require('./utils');


const setupOffers = async (utils) => {
  const accounts = await getAccounts();
  const {offers, events, token } = utils;
  for(let i=0; i<4; i++){
    try{
      const hashes = events.slice(i*10,(i*10)+10).map(event => event.dataHash);
      await token.approve(offers.address, 10, { from: accounts[i+1], gas: 500000, gasPrice: 1});
      await offers.makeOffers(hashes, 'HQmiMPrZAcfg3gQYNaFoEJVZbKCNA3NCazHAiXE+Yjg=', [1,1,1,1,1,1,1,1,1,1], {from: accounts[i+1], gas: 5000000, gasPrice: 1});
      console.log(`offers made by ${accounts[i+1]} for dataHashes: ${hashes.join(', ')}`);
    }
    catch(e){console.log(e);}
  }
};

module.exports={setupOffers};
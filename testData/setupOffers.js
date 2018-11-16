const {getAccounts} = require('./utils');


const setupOffers = async (utils) => {
  const accounts = await getAccounts();
  const {offers, events, token } = utils;
  const offerPromises = [];
  console.log('making offers');
  for(let i=0; i<4; i++){
    try{
      const hashes = events.slice(i*10,(i*10)+10).map(event => event.dataHash);
      offerPromises.push(token.approve(offers.address, 10, { from: accounts[i+1].toLowerCase(), gas: 500000}).then(() => {
        offers.makeOffers(hashes, 'HQmiMPrZAcfg3gQYNaFoEJVZbKCNA3NCazHAiXE+Yjg=', [1,1,1,1,1,1,1,1,1,1], {from: accounts[i+1].toLowerCase(), gas: 5000000});
        }));
    }
    catch(e){console.log(e);}
  }
  await Promise.all(offerPromises);
  console.log('all offers made!');
};

module.exports={setupOffers};
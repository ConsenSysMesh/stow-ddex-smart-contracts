const {fixWatch, getPastEvents} = require('./events');

const setupApprovals = async (utils) => {
  const {offers, records, permissions} = utils;
  const offerEvent = fixWatch(offers.StowOfferMade, 'StowOfferMade', offers);
  let events = await getPastEvents(offerEvent);
  events = events.map((event) => ({dataHash: event.args.dataHash, buyer: event.args.buyer}));
  for(let i=0; i<events; i+2){
    try{
      const record = await records.records.call(events[i].dataHash);
      await permissions.grantAccess(events[i].dataHash, events[i].buyer, record[4], {from: record[0], gas: 5000000, gasPrice: 1});
      await offers.approveOffer(events[i].dataHash, events[i].buyer, {from: record[0], gas: 5000000, gasPrice: 1});
    }
    catch(e){console.log(e);}
  }
  console.log('half of records approved');
};

module.exports={setupApprovals};

const {fixWatch, getPastEvents} = require('./events');

const setupApprovals = async (utils) => {
  const {offers, records, permissions} = utils;
  const offerEvent = fixWatch(offers.LinniaOfferMade, 'LinniaOfferMade', offers);
  let events = await getPastEvents(offerEvent);
  events = events.map((event) => ({dataHash: event.args.dataHash, buyer: event.args.buyer}));
  const approvalPromises = [];
  console.log('approving offers');
  for(let i=0; i<events; i+2){
    try{
        approvalPromises.push(records.records.call(events[i].dataHash).then((record) => {
        permissions.grantAccess(events[i].dataHash, events[i].buyer, record[4], {from: record[0].toLowerCase(), gas: 5000000});
        }).then(() => {
        offers.approveOffer(events[i].dataHash, events[i].buyer, {from: record[0].toLowerCase(), gas: 5000000});
        }));
    }
    catch(e){console.log(e);}
  }
  await Promise.all(approvalPromises);
  console.log('half of records approved');
};

module.exports={setupApprovals};
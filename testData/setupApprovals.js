const {getAccounts} = require('./utils');
const {fixWatch, getPastEvents} = require('./events');

const setupApprovals = async (utils) => {
	const accounts = await getAccounts()
	const {offers, records, permissions} = utils;
	const event = fixWatch(offers['LinniaOfferMade'], 'LinniaOfferMade', offers);
    let events = await getPastEvents(event)
	events = events.map((event) => {return {dataHash: event.args.dataHash, buyer: event.args.buyer}})
	for(let i=0; i<events; i+2){
	try{
	let record = await records.records.call(events[i].dataHash)
	await permissions.grantAccess(events[i].dataHash, events[i].buyer, record[4], {from: record[0], gas: 5000000, gasPrice: 1})
	await offers.approveOffer(events[i].dataHash, events[i].buyer, {from: record[0], gas: 5000000, gasPrice: 1})
	}
	catch(e){console.log(e)}
	}
	console.log('half of records approved')
}

module.exports={setupApprovals}
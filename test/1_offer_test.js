import eutil from 'ethereumjs-util';
import { assertRevert } from 'openzeppelin-solidity/test/helpers/assertRevert';

const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LINToken = artifacts.require('@linniaprotocol/linnia-token-contracts/contract/LINToken.sol');
const LinniaHub = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaHub.sol');
const LinniaUsers = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaUsers.sol');

const testDataContent = '{"foo":"bar","baz":42}';
const testDataHash = eutil.bufferToHex(eutil.sha3(testDataContent));
const offerAmount = 1;

contract('LinniaOffers', (accounts) => {
  let hub;
  let users;
  let token;
  let instance;

  beforeEach('deploy a new offers contract', async () => {
    hub = await LinniaHub.new();
    users = await LinniaUsers.new(hub.address);
    await hub.setUsersContract(users.address);

    token = await LINToken.new();
    await token.unpause();

    instance = await LinniaOffers.new(token.address, hub.address);
  });

  describe('makeOffer:', () => {
    it('should allow linnia users with balance to make offers after approving transfer', async () => {
      await users.register();
      await token.approve(instance.address, offerAmount);
      await instance.makeOffer(testDataHash);
    });

    it('should create a new, unfulfilled offer', async () => {
      await users.register();
      await token.approve(instance.address, offerAmount);
      await instance.makeOffer(testDataHash);
      const offer = await instance.offers.call(testDataHash, accounts[0]);
      const hasOffered = offer[0];
      const isFulfilled = offer[1];
      assert.equal(hasOffered, true);
      assert.equal(isFulfilled, false);
    });

    it('should take the linnia balance from the offerer', async () => {
      await users.register();
      const balance = await token.balanceOf(accounts[0]);
      await token.approve(instance.address, offerAmount);
      await instance.makeOffer(testDataHash);
      const newBalance = await token.balanceOf(accounts[0]);
      assert.equal(newBalance, balance - offerAmount);
    });

    it('should not allow users to make offers without approving transfer', async () => {
      await users.register();
      await assertRevert(instance.makeOffer(testDataHash));
    });

    it('should not allow unregistered users to make offers', async () => {
      await token.approve(instance.address, offerAmount);
      await assertRevert(instance.makeOffer(testDataHash));
    });

    it('should not let users with insufficient balance make offers', async () => {
      const asPoorUser = { from: accounts[1] };
      await users.register(asPoorUser);
      await token.approve(instance.address, offerAmount, asPoorUser);
      await assertRevert(instance.makeOffer(testDataHash, asPoorUser));
    });

    it('should not let users make offer for the same record more than once', async () => {
      await users.register();
      await token.approve(instance.address, offerAmount);
      await instance.makeOffer(testDataHash);
      await assertRevert(instance.makeOffer(testDataHash));
    });
  });
});

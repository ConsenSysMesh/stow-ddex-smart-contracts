import eutil from 'ethereumjs-util';
import { assertRevert } from 'openzeppelin-solidity/test/helpers/assertRevert';

const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');
const LinniaDDEXHub = artifacts.require('./LinniaDDEXHub.sol');
const LINToken = artifacts.require('@linniaprotocol/linnia-token-contracts/contract/LINToken.sol');
const LinniaHub = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaHub.sol');
const LinniaUsers = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaUsers.sol');

const testDataContent = '{"foo":"bar","baz":42}';
const testDataHash = eutil.bufferToHex(eutil.sha3(testDataContent));
const testAmount = 1000;
const testPublicKey = '5db5f3b5a602022a5d9a059faff9bd98de81c58c6de8ad6a95636d468536acab87d74d2319f6edaaf27c8061c6b941de3b97768498b1610ae89dd7eb5a7d5ac6';

contract('LinniaOffers', (accounts) => {
  let ddexhub;
  let hub;
  let users;
  let token;
  let staking;
  let instance;
  let stakeAmount;

  beforeEach('deploy a new offers contract', async () => {
    hub = await LinniaHub.new();
    users = await LinniaUsers.new(hub.address);
    await hub.setUsersContract(users.address);

    token = await LINToken.new();
    await token.unpause();

    ddexhub = await LinniaDDEXHub.new(hub.address, token.address);

    staking = await LinniaStaking.new(ddexhub.address);
    await staking.stakeAmount().then(stakeAmountBN => {
      stakeAmount = stakeAmountBN.toNumber();
    });
    
    await ddexhub.setStakingContract(staking.address);

    instance = await LinniaOffers.new(ddexhub.address);
  });

  describe('makeOffer:', () => {
    it('should allow linnia users with balance to make offers after staking and approving transfer', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount);
      await instance.makeOffer(testDataHash, testPublicKey, testAmount);
    });

    it('should not allow linnia users with balance to make offers without staking', async () => {
      await users.register();
      await token.approve(instance.address, testAmount);
      assertRevert(instance.makeOffer(testDataHash, testPublicKey, testAmount));
    });

    it('should create a new, unfulfilled offer', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount);
      await instance.makeOffer(testDataHash, testPublicKey, testAmount);
      const offer = await instance.offers.call(testDataHash, accounts[0]);
      const hasOffered = offer[0];
      const isFulfilled = offer[1];
      assert.equal(hasOffered, true);
      assert.equal(isFulfilled, false);
    });

    it('should take the linnia balance from the offerer', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      const balance = await token.balanceOf(accounts[0]);
      await token.approve(instance.address, testAmount);
      await instance.makeOffer(testDataHash, testPublicKey, testAmount);
      const newBalance = await token.balanceOf(accounts[0]);
      assert.equal(newBalance, balance - testAmount);
    });

    it('should not allow users to make offers without approving transfer', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await assertRevert(instance.makeOffer(testDataHash, testPublicKey, testAmount));
    });

    it('should not allow unregistered users to make offers', async () => {
      await token.approve(instance.address, testAmount);
      await assertRevert(instance.makeOffer(testDataHash, testPublicKey, testAmount));
    });

    it('should not let users with insufficient balance make offers', async () => {
      const asPoorUser = { from: accounts[1] };
      await users.register(asPoorUser);
      await token.approve(instance.address, testAmount, asPoorUser);
      await assertRevert(instance.makeOffer(testDataHash, testPublicKey, testAmount, asPoorUser));
    });

    it('should not let users make offer for the same record more than once', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount);
      await instance.makeOffer(testDataHash, testPublicKey, testAmount);
      await assertRevert(instance.makeOffer(testDataHash, testPublicKey, testAmount));
    });
  });
});
import { assertRevert } from 'openzeppelin-solidity/test/helpers/assertRevert';

const StowStaking = artifacts.require('./StowStaking.sol');
const StowDDEXHub = artifacts.require('./StowDDEXHub.sol');
const STOWToken = artifacts.require('@stowprotocol/stow-token-contracts/contract/STOWToken.sol');
const StowHub = artifacts.require('@stowprotocol/stow-smart-contracts/contract/StowHub.sol');
const StowUsers = artifacts.require('@stowprotocol/stow-smart-contracts/contract/StowUsers.sol');

contract('StowStaking', (accounts) => {
  let ddexhub;
  let hub;
  let users;
  let token;
  let instance;
  let stakeAmount;

  beforeEach('deploy a new stake contract', async() => {
    hub = await StowHub.new();
    users = await StowUsers.new(hub.address);
    await hub.setUsersContract(users.address);
    token = await STOWToken.new();
    await token.unpause();
    ddexhub = await StowDDEXHub.new(hub.address, token.address);

    instance = await StowStaking.new(ddexhub.address);
    await instance.stakeAmount().then(stakeAmountBN => {
      stakeAmount = stakeAmountBN.toNumber();
    });

  });

  describe('staking some Stow:', () => {

    it('should allow stow users with balance to stake after approving transfer', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
    });

    it('should create a new stake', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      const stake = await instance.stakes.call(accounts[0]);
      const hasStaked = stake[0];
      const amountStaked = stake[1];
      assert.equal(hasStaked, true);
      assert.equal(amountStaked, 100);
    });

    it('should check if a user is staked', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      const isStaked = await instance.isUserStaked(accounts[0]);
      assert.equal(isStaked, true);
    });

    it('should check if a user is not staked', async() => {
      const isStaked = await instance.isUserStaked(accounts[1]);
      assert.equal(isStaked, false);
    });

    it('should change stake price', async() => {
      await instance.updateStake(stakeAmount + 100);
      const newStakeAmount = await instance.stakeAmount();
      assert.equal(newStakeAmount, stakeAmount + 100);
    });

    it('should take the stow balance from the staker', async() => {
      await users.register();
      const balance = await token.balanceOf(accounts[0]);
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      const newBalance = await token.balanceOf(accounts[0]);
      assert.equal(newBalance, balance - stakeAmount);
    });

    it('should not allow users to make stakes without approving transfer', async() => {
      await users.register();
      await assertRevert(instance.makeStake());
    });

    it('should not allow unregistered users to make a stake', async() => {
      await token.approve(instance.address, stakeAmount);
      await assertRevert(instance.makeStake());
    });

    it('should not let users with insufficient balance make a stake', async() => {
      const asPoorUser = { from: accounts[1] };
      await users.register(asPoorUser);
      await token.approve(instance.address, stakeAmount, asPoorUser);
      await assertRevert(instance.makeStake(asPoorUser));
    });

    it('should not let users make stake more than once', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      await assertRevert(instance.makeStake());
    });

    it('should let users create and then withdraw a stake', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      let stake = await instance.stakes.call(accounts[0]);
      let hasStaked = stake[0];
      let amountStaked = stake[1];
      assert.equal(hasStaked, true);
      assert.equal(amountStaked, 100);
      await instance.withdrawStake();
      stake = await instance.stakes.call(accounts[0]);
      [hasStaked, amountStaked] = stake;
      assert.equal(hasStaked, false);
      assert.equal(amountStaked, 0);
    });

    it('should not let users withdraw more than once', async() => {
      await users.register();
      await token.approve(instance.address, stakeAmount);
      await instance.makeStake();
      await instance.withdrawStake();
      await assertRevert(instance.withdrawStake());
    });

    it('should not let unstaked users withdraw', async() => {
      await users.register();
      await assertRevert(instance.withdrawStake());
    });

    it('should not allow unregistered users to withdraw a stake', async() => {
      await assertRevert(instance.withdrawStake());
    });
  });
});

import { assertRevert } from 'openzeppelin-solidity/test/helpers/assertRevert';

const STOWToken = artifacts.require('@stowprotocol/stow-token-contracts/contract/STOWToken.sol');
const StowHub = artifacts.require('@stowprotocol/stow-smart-contracts/contract/StowHub.sol');
const StowDDEXHub = artifacts.require('./StowDDEXHub.sol');

contract('DDexHub', accounts => {

  let ddexhub;
  let hub;
  let token;

  beforeEach('deploy a new DDexHub contract', async () => {

    hub = await StowHub.new();

    token = await STOWToken.new();
    await token.unpause();

    ddexhub = await StowDDEXHub.new(hub.address, token.address);

  });

  describe('constructor', () => {

    it('should set admin correctly', async () => {
      const newInstance = await StowDDEXHub.new(hub.address, token.address);
      assert.equal(await newInstance.owner(), accounts[0]);
    });

    it('should initialize hub, token addressses to proper value', async () => {
      assert.equal(await ddexhub.hubContract(), hub.address);
      assert.equal(await ddexhub.tokenContract(), token.address);
    });

    it('should initialize offers, staking addresss to zero', async () => {
      assert.equal(await ddexhub.offersContract(), 0);
      assert.equal(await ddexhub.stakingContract(), 0);
    });

  });

  describe('set offers contract', () => {
    it('should allow admin to set offers address', async () => {
      const tx = await ddexhub.setOffersContract(42);
      assert.equal(tx.logs[0].event, 'StowOffersContractSet');
      assert.equal(tx.logs[0].args.from, 0);
      assert.equal(tx.logs[0].args.to, 42);
      assert.equal(await ddexhub.offersContract(), 42);
    });

    it('should not allow non-admin to set offers address', async () => {
      await assertRevert(ddexhub.setOffersContract(42, { from: accounts[1] }));
    });
  });

  describe('set staking contract', () => {
    it('should allow admin to set staking address', async () => {
      const tx = await ddexhub.setStakingContract(42);
      assert.equal(tx.logs[0].event, 'StowStakingContractSet');
      assert.equal(tx.logs[0].args.from, 0);
      assert.equal(tx.logs[0].args.to, 42);
      assert.equal(await ddexhub.stakingContract(), 42);
    });

    it('should not allow non-admin to set staking address', async () => {
      await assertRevert(
        ddexhub.setStakingContract(42, { from: accounts[1] })
      );
    });
  });

  describe('set hub contract to new address', () => {
    it('should allow admin to set hub address', async () => {
      const tx = await ddexhub.setHubContract(42);
      assert.equal(tx.logs[0].event, 'StowHubContractSet');
      assert.equal(tx.logs[0].args.from, hub.address);
      assert.equal(tx.logs[0].args.to, 42);
      assert.equal(await ddexhub.hubContract(), 42);
    });

    it('should not allow non-admin to set hub address', async () => {
      await assertRevert(
        ddexhub.setHubContract(42, { from: accounts[1] })
      );
    });
  });

  describe('set token contract to new address', () => {
    it('should allow admin to set token address', async () => {
      const tx = await ddexhub.setTokenContract(42);
      assert.equal(tx.logs[0].event, 'StowTokenContractSet');
      assert.equal(tx.logs[0].args.from, token.address);
      assert.equal(tx.logs[0].args.to, 42);
      assert.equal(await ddexhub.tokenContract(), 42);
    });
    it('should not allow non-admin to set token address', async () => {
      await assertRevert(
        ddexhub.setTokenContract(42, { from: accounts[1] })
      );
    });
  });
  // copy paste from records contract
  describe('destructible', () => {
    it('should not allow non-admin to destroy', async () => {
      await assertRevert(ddexhub.destroy({ from: accounts[1] }));
    });

    it('should allow admin to destroy', async () => {
      const admin = accounts[0];
      assert.notEqual(web3.eth.getCode(ddexhub.address), '0x0');
      const tx = await ddexhub.destroy({ from: admin });
      assert.equal(tx.logs.length, 0, `did not expect logs but got ${tx.logs}`);
      assert.equal(web3.eth.getCode(ddexhub.address), '0x0');
    });

    it('should allow admin to destroyAndSend', async () => {
      const admin = accounts[0];
      assert.notEqual(web3.eth.getCode(ddexhub.address), '0x0');
      const tx = await ddexhub.destroyAndSend(admin, { from: admin });
      assert.equal(tx.logs.length, 0, `did not expect logs but got ${tx.logs}`);
      assert.equal(web3.eth.getCode(ddexhub.address), '0x0');
      assert.equal(web3.eth.getBalance(ddexhub.address).toNumber(), 0);
    });
  });
});

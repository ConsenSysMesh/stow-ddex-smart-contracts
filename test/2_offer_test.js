import eutil from 'ethereumjs-util';
import { assertRevert } from 'openzeppelin-solidity/test/helpers/assertRevert';

const LinniaOffers = artifacts.require('./LinniaOffers.sol');
const LinniaStaking = artifacts.require('./LinniaStaking.sol');
const LinniaDDEXHub = artifacts.require('./LinniaDDEXHub.sol');
const LINToken = artifacts.require('@linniaprotocol/linnia-token-contracts/contract/LINToken.sol');
const LinniaHub = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaHub.sol');
const LinniaUsers = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaUsers.sol');
const LinniaRecords = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaRecords.sol');
const LinniaPermissions = artifacts.require('@linniaprotocol/linnia-smart-contracts/contract/LinniaPermissions.sol');

const testDataContent = '{"foo":"bar","baz":42}';
const testDataContentTwo = '{"bar": "baz"}';
const testDataHash = eutil.bufferToHex(eutil.sha3(testDataContent));
const testDataHashTwo = eutil.bufferToHex(eutil.sha3(testDataContentTwo));
const testAmount = 1000;
const loan = 1000000;
const testMetadata = 'yessirimmetadata';
const testDataUri = 'i-am-a-uri';
const testPublicKey = 'g8R3h9lGMiXkX7o8pxqkkOn1ZO/sE0GDT/daKBSsN1A=';

contract('LinniaOffers', (accounts) => {
  let ddexhub;
  let hub;
  let users;
  let token;
  let staking;
  let instance;
  let stakeAmount;
  let records;
  let permissions;

  beforeEach('deploy a new offers contract', async () => {
    hub = await LinniaHub.new();
    users = await LinniaUsers.new(hub.address);
    records = await LinniaRecords.new(hub.address);
    permissions = await LinniaPermissions.new(hub.address);

    await hub.setRecordsContract(records.address);
    await hub.setUsersContract(users.address);
    await hub.setPermissionsContract(permissions.address);

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

  describe('makeOffers', () => {
    it('should allow a user to make multiple offers', async () => {
      const [ buyer ] = accounts;
      const dataHashes = [ testDataHash, testDataHashTwo ];
      const amounts = [ testAmount, testAmount ];

      await users.register({ from: buyer });
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount * 2);
      await instance.makeOffers(dataHashes, testPublicKey, amounts);
      assert.isTrue(await instance.hasOffered(testDataHash));
      assert.isTrue(await instance.hasOffered(testDataHashTwo));
    });

    it('shouldnt allow uneven length array arguments', async () => {
      const [ buyer ] = accounts;
      const dataHashes = [ testDataHash ];
      const amounts = [ testAmount, testAmount ];

      await users.register({ from: buyer });
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount * 2);
      assertRevert(instance.makeOffers(dataHashes, testPublicKey, amounts));
    });

    it('should not allow dupes', async () => {
      const [ buyer ] = accounts;
      const dataHashes = [ testDataHash, testDataHashTwo ];
      const amounts = [ testAmount, testAmount ];

      await users.register({ from: buyer });
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      await token.approve(instance.address, testAmount * 3);
      await instance.makeOffer(testDataHashTwo, testPublicKey, testAmount);
      assertRevert(instance.makeOffers(dataHashes, testPublicKey, amounts));
      assert.isFalse(await instance.hasOffered(testDataHash));
    });
  });

  describe('approveOffer:', () => {
    it('should allow a user to her approve offers', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await instance.approveOffer(testDataHash, buyer, { from: seller });
    });

    it('should give the seller the LIN', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await instance.approveOffer(testDataHash, buyer, { from: seller });
      const balance = await token.balanceOf(seller);
      assert.equal(balance, loan + testAmount - stakeAmount);
    });

    it('should not allow seller to approve unfulfilled offer', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      // dont create permission for buyer
      // await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: seller }));
    });

    it('should not allow unstaked seller to approve', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      // dont stake
      // await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: seller }));
    });

    it('should not allow unstaked seller to approve', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      // dont stake
      // await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: seller }));
    });

    it('should not allow someone who is not the owner to approve', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: buyer }));
    });

    it('should not allow someone who is not the owner to approve', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: buyer }));
    });

    it('should not allow someone to approve a fulfilled order', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await instance.approveOffer(testDataHash, buyer, { from: seller });
      await assertRevert(instance.approveOffer(testDataHash, buyer, { from: seller }));
    });
  });

  describe('revokeOffer:', () => {
    it('should allow to revoke an offer after made it', async () => {
      await users.register();
      await token.approve(staking.address, stakeAmount);
      await staking.makeStake();
      const initialBalance = await token.balanceOf(accounts[0]);
      await token.approve(instance.address, testAmount);
      await instance.makeOffer(testDataHash, testPublicKey, testAmount);
      const offer = await instance.offers.call(testDataHash, accounts[0]);
      const hasOffered = offer[0];
      assert.equal(hasOffered, true);
      await instance.revokeOffer(testDataHash);
      const finalBalance = await token.balanceOf(accounts[0]);
      assert.isTrue(initialBalance.eq(finalBalance));
      const offer2 = await instance.offers.call(testDataHash, accounts[0]);
      const hasOffered2 = offer2[0];
      assert.equal(hasOffered2, false);
    });

    it('should not allow to revoke an offer from another user', async () => {
      const [ user1, user2 ] = accounts;
      await users.register({ from: user1 });
      await users.register({ from: user2 });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: user2 });
      await token.transfer(user2, loan, { from: user1 });
      await token.approve(staking.address, stakeAmount, { from: user1 });
      await token.approve(staking.address, stakeAmount, { from: user2 });
      await staking.makeStake({ from: user2 });
      await staking.makeStake({ from: user1 });
      await token.approve(instance.address, testAmount, { from: user1 });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: user1 });
      await assertRevert(instance.revokeOffer(testDataHash, { from: user2 }));
    });

    it('should not allow to revoke an offer already fulfilled', async () => {
      const [ buyer, seller ] = accounts;
      await users.register({ from: buyer });
      await users.register({ from: seller });
      await records.addRecord(testDataHash, testMetadata, testDataUri, { from: seller });
      await token.transfer(seller, loan, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: buyer });
      await token.approve(staking.address, stakeAmount, { from: seller });
      await staking.makeStake({ from: seller });
      await staking.makeStake({ from: buyer });
      await token.approve(instance.address, testAmount, { from: buyer });
      await instance.makeOffer(testDataHash, testPublicKey, testAmount, { from: buyer });
      await permissions.grantAccess(testDataHash, buyer, 'theNewDataUri', { from: seller });
      await instance.approveOffer(testDataHash, buyer, { from: seller });
      await assertRevert(instance.revokeOffer(testDataHash, { from: buyer }));
    });
  });
});

const LinniaOffers = artifacts.require('./LinniaOffers.sol');

contract('LinniaOffers', () => {
  let instance;

  beforeEach('deploy a new offers contract', async () => {
    instance = await LinniaOffers.new();
  });

  describe('should say hello', () => {
    it('say hello', async () => {
      const hello = await instance.sayHello();
      assert.equal('hello world', hello);
    });
  });
});
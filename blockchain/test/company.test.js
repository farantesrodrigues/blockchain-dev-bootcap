var Company = artifacts.require("Company");

contract("Company", function(accounts) {
  const ownerAddress = accounts[0];
  const storeAddress = accounts[1];
  const otherStoreAddress = accounts[2];

  let instance;

  beforeEach(async () => {
    instance = await Company.new();
  });

  describe("Stores can be added, removed and read", async () => {
    it("adds a store", async () => {
      await instance.addStore(storeAddress);
      const stores = await instance.readUserStores();
      assert.equal(stores[0], storeAddress, "store should have been added");
    });

    it("removes a store", async () => {
      await instance.addStore(storeAddress);
      await instance.removeStore(storeAddress);
      const stores = await instance.readUserStores();
      assert.equal(
        stores[0],
        "0x0000000000000000000000000000000000000000",
        "stores deleted return a null reresentation"
      );
    });

    it("reads a store", async () => {
      await instance.addStore(storeAddress);
      await instance.addStore(otherStoreAddress);
      const stores = await instance.readUserStores();
      assert.equal(stores.length, 2, "should add 2 stores");
    });
  });
});

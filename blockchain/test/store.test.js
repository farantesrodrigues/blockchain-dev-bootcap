var Store = artifacts.require("Store");
let catchRevert = require("./exception-helpers").catchRevert;

contract("Store", function(accounts) {
  const firstAccount = accounts[0];
  const secondAccount = accounts[1];
  const thirdAccount = accounts[2];
  const fourthAccount = accounts[3];

  const defaultStoreName = "NEW_STORE";
  const newStoreName = "NEW SHOP";

  const ownerName = "John";
  const managerName = "George";
  const employeeName = "Paul";
  const clientName = "Ringo";

  let instance;

  beforeEach(async () => {
    instance = await Store.new(ownerName);
  });

  describe("Setup", async () => {
    it("store owner should be registered as user", async () => {
      const userDetails = await instance.retrieveUser(firstAccount);
      assert.equal(
        userDetails.name,
        ownerName,
        "the owner name should match the contract initiator"
      );
    });

    it("store name should be set to default and retrievable", async () => {
      const storeName = await instance.storeName();
      assert.equal(
        storeName,
        defaultStoreName,
        "default store name is NEW_STORE"
      );
    });
  });

  describe("Functions", async () => {
    describe("store name should be modifiable my manager", async () => {
      it("manager can change the name", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        await instance.modifyStoreName(newStoreName, { from: secondAccount });
        const storeName = await instance.storeName();
        assert.equal(
          storeName,
          newStoreName,
          "the store name should be modified"
        );
      });

      it("employee can't change the store name", async () => {
        await instance.registerEmployee(thirdAccount, employeeName, {
          from: firstAccount
        });
        await catchRevert(
          instance.modifyStoreName(newStoreName, { from: thirdAccount })
        );
      });
    });

    describe("users should be registered according to role", async () => {
      it("owner can register manager", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        const { name, role, responsible } = await instance.retrieveUser(
          secondAccount,
          { from: firstAccount }
        );
        assert.equal(name, managerName, "user name should be correct");
        assert.equal(role, 1, "role should be of manager");
        assert.equal(
          responsible,
          firstAccount,
          "registrer should be the responsible"
        );
      });

      it("owner can register manager, employee and client", async () => {
        await instance.registerEmployee(thirdAccount, employeeName, {
          from: firstAccount
        });
        const { name, role, responsible } = await instance.retrieveUser(
          thirdAccount,
          { from: firstAccount }
        );
        assert.equal(name, employeeName, "user name should be correct");
        assert.equal(role, 2, "role should be of employee");
        assert.equal(
          responsible,
          firstAccount,
          "registrer should be the responsible"
        );
      });

      it("owner can register manager, employee and client", async () => {
        await instance.registerClient(fourthAccount, clientName, {
          from: firstAccount
        });
        const { name, role, responsible } = await instance.retrieveUser(
          fourthAccount,
          { from: firstAccount }
        );
        assert.equal(name, clientName, "user name should be correct");
        assert.equal(role, 3, "role should be of client");
        assert.equal(
          responsible,
          firstAccount,
          "registrer should be the responsible"
        );
      });

      it("manager can register employee", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        await instance.registerEmployee(thirdAccount, employeeName, {
          from: secondAccount
        });
        const { name, role, responsible } = await instance.retrieveUser(
          thirdAccount,
          { from: secondAccount }
        );
        assert.equal(name, employeeName, "user name should be correct");
        assert.equal(role, 2, "role should be of employee");
        assert.equal(
          responsible,
          secondAccount,
          "registrer should be the responsible"
        );
      });

      it("manager can register client", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        await instance.registerClient(fourthAccount, clientName, {
          from: secondAccount
        });
        const { name, role, responsible } = await instance.retrieveUser(
          fourthAccount,
          { from: secondAccount }
        );
        assert.equal(name, clientName, "user name should be correct");
        assert.equal(role, 3, "role should be of employee");
        assert.equal(
          responsible,
          secondAccount,
          "registrer should be the responsible"
        );
      });

      it("manager can't register manager", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        await catchRevert(
          instance.registerManager(thirdAccount, employeeName, {
            from: secondAccount
          })
        );

        it("employee can register client", async () => {
          await instance.registerEmployee(thirdAccount, employeeName, {
            from: firstAccount
          });
          await instance.registerClient(fourthAccount, clientName, {
            from: thirdAccount
          });
          const { name, role, responsible } = await instance.retrieveUser(
            fourthAccount,
            { from: thirdAccount }
          );
          assert.equal(name, clientName, "user name should be correct");
          assert.equal(role, 3, "role should be of employee");
          assert.equal(
            responsible,
            secondAccount,
            "registrer should be the responsible"
          );
        });

        it("employee can't register employee or manager", async () => {
          await instance.registerEmployee(thirdAccount, employeeName, {
            from: firstAccount
          });
          await catchRevert(
            instance.registerManager(secondAccount, managerName, {
              from: secondAccount
            })
          );
          await catchRevert(
            instance.registerEmployee(fourthAccount, clientName, {
              from: secondAccount
            })
          );
        });
      });
    });

    describe("users should be retrievable", async () => {
      it("manager can change the name", async () => {
        await instance.registerManager(secondAccount, managerName, {
          from: firstAccount
        });
        const { name } = await instance.retrieveUser(secondAccount, {
          from: secondAccount
        });
        const storeName = await instance.storeName();
        assert.equal(name, managerName, "name should be written and read");
      });
    });
  });
});

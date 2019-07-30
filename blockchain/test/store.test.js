var Store = artifacts.require('Store')
let catchRevert = require("./exception-helpers").catchRevert
const BN = web3.utils.BN

contract('Store', function(accounts) {

    const firstAccount = accounts[0]
    const secondAccount = accounts[1]
    const thirdAccount = accounts[2]

    const storeName = "NEW SHOP";

    const ownerName = "John";
    const managerName = "George";
    const employeeName = "Paul";
    const clientName = "Ringo";

    let instance

    beforeEach(async () => {
        instance = await Store.new(ownerName);
    })

    describe("Setup", async() => {

        it("store owner should be registered as user", async() => {
            const userDetails = await instance.retrieveUser(firstAccount)
            assert.equal(userDetails.name, ownerName, "the owner name should match the contract initiator")
        })

        it("store name should be set to default and retrievable", async() => {
            const storeName = await instance.storeName()
            assert.equal(storeName, 'NEW_STORE', "default store name is NEW_STORE")
        })
    })
})



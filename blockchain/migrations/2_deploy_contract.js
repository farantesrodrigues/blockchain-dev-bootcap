const Company = artifacts.require("Company");
const Store = artifacts.require("Store");

module.exports = function(deployer) {
  deployer.deploy(Company);
  deployer.deploy(Store, "John");
};

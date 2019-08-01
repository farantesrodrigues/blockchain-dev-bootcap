pragma solidity ^0.5.0;

contract Company {
    // mapping of user addresses to store contracts (a list because one2many)
    mapping(address => address[]) stores;

    // helper mapping to store stores indexes in array of stores
    mapping(address => uint256) indexes;

    function addStore(address _storeAddress) public returns(address[] memory) {
        uint256 index = stores[msg.sender].length;
        stores[msg.sender].push(_storeAddress);
        indexes[_storeAddress] = index;
        return stores[msg.sender];
    }

    function removeStore(address _storeAddress) public {
        delete stores[msg.sender][indexes[_storeAddress]];
    }

    function readUserStores() public view returns(address[] memory) {
        return stores[msg.sender];
    }
}
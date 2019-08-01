pragma solidity ^0.5.0;

import {Strings} from "../libraries/Strings.sol";

contract Store {

    string public storeName = 'NEW_STORE';

    // an enum because permissions are decreasing with the index
    enum Role {OWNER, MANAGER, EMPLOYEE, CLIENT}

    // a name and role, just to know who we're talking to, and a responsible, the person that registers
    struct User {
        string name;
        Role role;
        address responsible;
    }

    // the main storage of this contract: a mapping of addresses to user objects
    mapping(address => User) users;

    // an event to help debugging / hook into
    event RegisteredNewUser(string _name, Role _role);

    // one contract per store. even the owner is required to have a name - we're pretty familiar
    constructor(string memory _name) public {
        registerUser(msg.sender, _name, Role.OWNER);
    }

    // rejects non-owners
    modifier canOwner() {
        require(users[msg.sender].role == Role.OWNER, 'sender is not owner');
        _;
    }

    // rejects clients or users not registered
    modifier canManager() {
        require(users[msg.sender].role <= Role.MANAGER, 'sender is not manager nor owner');
        _;
    }

    // rejects clients or users not registered
    modifier canEmployee() {
        require(users[msg.sender].role <= Role.EMPLOYEE, 'sender does not belong to the business');
        _;
    }

    // only managers (or owners) can register employees
    function modifyStoreName(string memory _name)
        public canManager
    {
        storeName = _name;
    }

    // only owners can register managers
    function registerManager(address _address, string memory _name)
        public canOwner
    {
        registerUser(_address, _name, Role.MANAGER);
    }

    // only managers (or owners) can register employees
    function registerEmployee(address _address, string memory _name)
        public canManager
    {
        registerUser(_address, _name, Role.EMPLOYEE);
    }

    // only managers (or owners) can register employees
    function registerClient(address _address, string memory _name)
        public canEmployee
    {
        registerUser(_address, _name, Role.CLIENT);
    }

    function registerUser(address _address, string memory _name, Role _role) private {
        Strings.validate(_name);
        User memory newUser;
        newUser.name = _name;
        newUser.responsible = msg.sender;
        newUser.role = Role(_role);
        users[_address] = newUser;
        emit RegisteredNewUser(_name, _role);
    }

    // only employees can access user data
    function retrieveUser(address _user)
        public view canEmployee returns(string memory name, Role role, address responsible)
    {
        return (users[_user].name, users[_user].role, users[_user].responsible);
    }
}
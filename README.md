### Consensys project 
#####Blockchain Developer Bootcamp Spring 2019

Story :

The project has 2 features :
1. simple transaction and balance reading making use of web3js (not so much in scope)
2. **A decentralized store people management as if in a franchised company** :
   There are 2 contracts outlined : 1 for Company and 1 for Store
   These represent a one2many relationship of companies to store (i.e.: one company holds multiple stores)
   The Company contract is quite simple - mainly consists of a mapping of the stores to the company owner
   The store contract allows some simplified people management features like registering managers, employees and clients. These have different sets of permissions. The only activity allowed is registering people and so, for example, an owner can register a manager, but not vice-versa. Permissions are descending according to the reponsability in the business. The idea is summarized in an Enum {OWNER, MANAGER, EMPLOYEE, CLIENT}. The first 3 are meant to use this application to register newcomers.

   The Smart Contracts apply modifiers to handle the permissions and expose multiple methods for the contrcts to be interacted. The contracts can be compiled by running in the console :

   ```javascript
   truffle compile
   ```

   A suite of tests is covering the contracts. They can be ran as usual by launching a network, compiling, migrating and launching the test command.

    ```javascript
    truffle develop
    compile
    migrate
    test
    ```

    There are 2 distinct parts: the blockchain and the frontend. I followed the approach of [NG-ES/ANGULARTRUFFLEDAPP](https://www.trufflesuite.com/boxes/angulartruffledapp) which I used in the beginning to bootstrap the project.

    The frontend can be ran using the command `npm start` - this will launch a dev server and the frontend can be interacted with.

    Clicking on the store icon inthe navbar, we will reach store home. From here we can use an existing address for a deployed contract in the network for a company or we can deploy one directly by clicking the designated button.

    Once we have a company registered in the service we can create stores, else we cannot. We can however interact with stores already deployed if we visit the path /`stores/front/:address` because in that case we are not dependent of registering the store in the company (thus taking advantage of the decentralization).

    The screens have a description of the functionality. To test teh application it is important to change accounts often because only then we can test the different permissions. Using Ganache is a suitable option for this. I setup a local project and entered the different accounts in Metamask (and connected to that network - localhost:7545). From there, I can toggle the different accounts and play with it.
    The Metamask extension doesn't always work perfectly, I'm unsure why, but the dialog doesn't open everytime I deploy a contract and easy to miss and chained approvals. For example : when we add a store, we deploy a store contract, but immediately after we call the `addStore()` method in the Company contract. Metamask asks approval for this but unless I open it deliberately, I fail to see it because I'm not notified.

    The crux of this project is in :
    1. blockchain/contracts/Store.sol
    2. blockchain/contracts/Company.sol
    3. frontend/src/app/store/services/store.service.ts
    4. frontend/src/app/store/components

    A note for some libraries borrowed from the [ethereum repo](https://github.com/ethereum/solidity-examples/tree/master/src). String checks were important to validate user input in the contract.

    A final note on vulnerabilities, the highest risk is for Denial of Service by Block Gas Limit because many functions change the state of the contract without upper boundaries. The case for companies where an indeterminate array of stores is assigned to each owner :

    ```
    contract Company {
        ...

        // helper mapping to store stores indexes in array of stores
        mapping(address => uint256) indexes;

        ...

        function removeStore(address _storeAddress) public {
            delete stores[msg.sender][indexes[_storeAddress]];
            emit StoreRemoved(_storeAddress);
        }

        ...
    }
    ```
    To avoid large array iterations an index mapping is created and direct methods are called such as the delete case in the removeStore method. Ultimately this problem must be tackled from teh business perspective either running a private network or accessing regularly the size of the contract storage and re-deploy new contracts.

    Any comments/questions : farantesrodrigues@gmail.com
    
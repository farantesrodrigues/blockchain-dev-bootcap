import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import Web3 from "web3";
import { Roles } from "../models";

declare let require: any;
const companyContract = require("../../../../../blockchain/build/contracts/Company.json");
const storeContract = require("../../../../../blockchain/build/contracts/Store.json");
declare let window: any;

export interface Transaction {
  from: string;
  to: string;
  value: string;
}

@Injectable({
  providedIn: "root"
})
export class StoreService {
  private web3: Web3;
  compatible: boolean;
  company$: BehaviorSubject<string> = new BehaviorSubject("");

  constructor(private snackbar: MatSnackBar) {
    this.loadWeb3();
  }

  getRegisteredCompany(): string {
    return this.company$.getValue();
  }

  async loadWeb3() {
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      // Web3 browser user detected. You can now use the provider.
      const provider = window["ethereum"] || window.web3.currentProvider;
      console.log("isMetaMask", provider.isMetaMask);
      this.web3 = new Web3(provider);

      try {
        // Request account access if needed
        const enabled = await provider.enable();
        console.log("metamask enabled", enabled);
        // Acccounts now exposed
        this.web3.eth.getCoinbase().then(a => console.log(a));
        this.web3.eth.getAccounts().then(a => console.log(a));
      } catch (error) {
        console.error(error);
      }
    } else {
      const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
      this.web3 = new Web3(provider);
    }
  }

  // deploys a new contract for a store and returns the contract address (if all goes well)
  private createStore(name: string): Promise<string> {
    return new Promise((res, rej) => {
      return this.web3.eth
        .getCoinbase()
        .then(async from => {
          const { bytecode, abi } = storeContract;
          const gas = await this.web3.eth.estimateGas({ data: bytecode });
          return new this.web3.eth.Contract(abi)
            .deploy({ data: bytecode, arguments: [name] })
            .send({ from, gas }, async (err: Error, hash: string) => {
              if (err) {
                rej("unable to create contract");
              } else {
                const receipt = await this.web3.eth.getTransactionReceipt(hash);
                res(receipt.contractAddress);
              }
            });
        })
        .catch(() => rej("unable to get user account"));
    });
  }

  // deploys a new contract for a company
  createCompany(): Promise<string> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth
        .getCoinbase()
        .then(async from => {
          const { bytecode, abi } = companyContract;
          const gas = await this.web3.eth.estimateGas({ data: bytecode });
          return new this.web3.eth.Contract(abi)
            .deploy({ data: bytecode })
            .send({ from, gas }, async (err: Error, hash: string) => {
              if (err) {
                rej("unable to create contract");
              } else {
                const receipt = await this.web3.eth.getTransactionReceipt(hash);
                this.snackbar.open("created company", null, { duration: 3000 });
                this.company$.next(receipt.contractAddress);
                res(receipt.contractAddress);
              }
            });
        })
        .catch(() => rej("unable to get user account"));
    });
  }

  registerExistingCompany(companyAddress: string) {
    this.company$.next(companyAddress);
  }

  listUserStores(): Promise<string[]> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = companyContract;
        const contract = new this.web3.eth.Contract(
          abi,
          this.company$.getValue()
        );
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .readUserStores()
          .call({ gas, from }, (err: Error, result: any) => {
            if (err) {
              rej("unable to read users from contract");
            } else {
              console.log("listUserStores", result);
              res(result);
            }
          });
      });
    });
  }

  addStore(name: string): Promise<string> {
    this.launchTransactionWarning();
    const companyAddress = this.company$.getValue();
    if (!companyAddress.length) {
      const a = this.snackbar.open(
        "I'm sorry, but there's no registered company - please go back to store home and add one",
        null,
        { duration: 5000 }
      );
      return a
        .afterDismissed()
        .pipe(map(() => undefined))
        .toPromise();
    } else {
      return new Promise((res, rej) => {
        return this.createStore(name).then(storeAddress => {
          return this.web3.eth.getCoinbase().then(async from => {
            const { bytecode, abi } = companyContract;
            const contract = new this.web3.eth.Contract(abi, companyAddress);
            const gas = await this.web3.eth.estimateGas({ data: bytecode });
            return contract.methods
              .addStore(storeAddress)
              .send({ gas, from }, (err: Error, result: any) => {
                if (err) {
                  rej("unable to add store to company");
                } else {
                  console.log("result from adding store", result);
                  res(storeAddress);
                }
              });
          });
        });
      });
    }
  }

  getStoreName(storeAddress: string): Promise<string> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .storeName()
          .call({ gas, from }, (err: Error, result: any) => {
            if (err) {
              rej("unable to add store to company");
            } else {
              console.log("result from getting store name", result);
              res(result);
            }
          });
      });
    });
  }

  getMyUser(
    storeAddress: string
  ): Promise<{ name: string; responsible: string; role: Roles }> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .retrieveUser(from)
          .call({ gas, from }, (err: Error, result: any) => {
            if (err) {
              console.error(err);
              rej("unable to add store to company");
            } else {
              console.log("result from getting user", result);
              res({
                name: result.name,
                responsible: result.responsible,
                role: (Roles[result.role] as unknown) as Roles
              });
            }
          });
      });
    });
  }

  modifyStoreName(storeAddress: string, storeName: string): Promise<boolean> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .modifyStoreName(storeName)
          .send({ gas, from }, (err: Error, result: any) => {
            if (err) {
              console.error(err);
              rej();
            } else {
              res(true);
            }
          });
      });
    });
  }

  registerManager(storeAddress: string, address: string, name: string): Promise<boolean> {
    console.log(storeAddress, address);
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .registerManager(address, name)
          .send({ gas, from }, (err: Error, result: any) => {
            if (err) {
              rej();
            } else {
              res(true);
            }
          });
      });
    });
  }

  registerEmployee(
    storeAddress: string,
    address: string, 
    name: string
  ): Promise<boolean> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .registerEmployee(address, name)
          .send({ gas, from }, (err: Error, result: any) => {
            if (err) {
              rej();
            } else {
              res(true);
            }
          });
      });
    });
  }

  registerClient(storeAddress: string, address: string, name: string): Promise<boolean> {
    this.launchTransactionWarning();
    return new Promise((res, rej) => {
      return this.web3.eth.getCoinbase().then(async from => {
        const { bytecode, abi } = storeContract;
        const contract = new this.web3.eth.Contract(abi, storeAddress);
        const gas = await this.web3.eth.estimateGas({ data: bytecode });
        return contract.methods
          .registerClient(address, name)
          .send({ gas, from }, (err: Error, result: any) => {
            if (err) {
              rej();
            } else {
              res(true);
            }
          });
      });
    });
  }

  launchTransactionWarning() {
    this.snackbar.open(
      "Make sure to approve all in metamask (contract transactions and contract calls)",
      null,
      { duration: 3000 }
    );
  }
}

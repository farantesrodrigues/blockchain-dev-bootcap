import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { from, Observable, of, Subject, zip } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import contract from "truffle-contract";
import Web3 from "web3";

declare let require: any;
const tokenAbi = require("../../../../../Blockchain/build/contracts/Payment.json");
declare let window: any;

@Injectable({
  providedIn: "root"
})
export class ContractService {
  private web3: Web3;
  public compatible: boolean;
  private accounts: string[];
  public accountsObservable = new Subject<string[]>();

  constructor(private snackbar: MatSnackBar) {
    // is web3 enabled
    if (
      typeof window.ethereum !== "undefined" ||
      typeof window.web3 !== "undefined"
    ) {
      // Web3 browser user detected. You can now use the provider.
      const provider = window["ethereum"] || window.web3.currentProvider;
      console.log("isMetaMask", provider.isMetaMask);
      this.web3 = new Web3(provider);
    } else {
      const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
      this.web3 = new Web3(provider);
    }
    console.log("web3.version", this.web3.version);
    console.log(
      "web3.defaultAccount",
      this.web3.defaultAccount,
      this.web3.eth.defaultAccount
    );
  }

  seeAccountInfo(): Observable<{ originAccount: string; balance: string }> {
    const that = this;
    return from(this.web3.eth.getCoinbase()).pipe(
      tap((account) => console.log("1", account, typeof account, this.web3.eth.defaultBlock)),
      switchMap(account => {
        return zip(of(account), this.web3.eth.getBalance(account, this.web3.eth.defaultBlock));
      }),
      tap(a => console.log("3", a)),
      map(([originAccount, balance]) => ({ originAccount, balance })),
      catchError((err: any) => {
        this.failure(
          "Could't get the account data, please check if metamask is running correctly and refresh the page"
        );
        return of({ originAccount: "unknown", balance: "-" });
      })
    );
  }

  refreshAccounts() {
    window.web3.eth.getAccounts((err, accs) => {
      console.log("Refreshing accounts");
      if (err === true) {
        console.warn("There was an error fetching your accounts.");
        console.log(err, accs);
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      if (
        !this.accounts ||
        this.accounts.length !== accs.length ||
        this.accounts[0] !== accs[0]
      ) {
        console.log("Observed new accounts");

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      console.log("ready");
    });
  }

  trasnferEther(originAccount: string, destinyAccount: string, amount: string) {
    return new Promise((resolve, reject) => {
      const paymentContract = contract(tokenAbi);
      paymentContract.setProvider(this.web3);

      paymentContract
        .deployed()
        .then(instance => {
          return instance.nuevaTransaccion(destinyAccount, {
            from: originAccount,
            value: window.web3.utils.toWei(amount, "ether")
          });
        })
        .then(status => {
          if (status) {
            return resolve({ status: true });
          }
        })
        .catch(error => {
          console.log(error);

          return reject("Error transfering Ether");
        });
    });
  }

  failure(message: string) {
    this.snackbar.open(message, "Dismiss");
  }

  succes() {
    this.snackbar.open("Transaction complete successfuly", "Dismiss");
  }
}

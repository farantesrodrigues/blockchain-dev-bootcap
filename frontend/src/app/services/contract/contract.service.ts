import { Injectable, NgZone } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { from, Observable, of, zip } from "rxjs";
import { catchError, first, map, switchMap } from "rxjs/operators";
import Web3 from "web3";

declare let require: any;
const tokenAbi = require("../../../../../Blockchain/build/contracts/Payment.json");
declare let window: any;

export interface Transaction {
  from: string;
  to: string;
  value: string;
}

@Injectable({
  providedIn: "root"
})
export class Web3Service {
  private web3: Web3;
  public compatible: boolean;

  constructor(private snackbar: MatSnackBar, private ngZone: NgZone) {
    this.loadWeb3();
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

  seeAccountInfo(): Observable<{ originAccount: string; balance: string }> {
    return from(this.web3.eth.getCoinbase()).pipe(
      switchMap(account => {
        const getBalance = from(this.web3.eth.getBalance(account)).pipe(
          map(wei => {
            return this.web3.utils.fromWei(wei, "ether");
          })
        );
        return zip(of(account), getBalance);
      }),
      map(([originAccount, balance]) => ({ originAccount, balance })),
      catchError((err: any) => {
        this.handleError(
          "Could't get the account data, please check if metamask is running correctly and refresh the page"
        );
        return of({ originAccount: "unknown", balance: "-" });
      }),
      first()
    );
  }

  // it's still not clear to me why can't I pipe into the stream to handle success and failure
  // I tried from operator to convert promise to observable, bindNodeCallback
  // (from here https://stackoverflow.com/questions/48876234/how-to-make-observable-from-callback)
  // I tried injecting ngZone because meybe something to do with angular,
  // and I tried the classical Promise based solution. Still no luck at handling the callback from
  // sendTransaction.
  async transferEther(to: string, amount: number) {
    const account = await this.web3.eth.getCoinbase();
    const value = this.web3.utils.toWei(amount.toString(), "ether");
    const transaction = { from: account, to, value };
    return new Promise(res => {
      this.web3.eth.sendTransaction(transaction).then(success => {
        if (success) {
          this.snackbar.open("transaction successful", "Dismiss", {
            duration: 3000
          });
        } else {
          this.handleError("something went wrong with transaction");
        }
        res(success);
      });
    });
  }

  handleError(message: string) {
    this.snackbar.open(message, "Dismiss");
  }
}

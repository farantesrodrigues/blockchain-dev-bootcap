import { Component, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Web3Service } from "src/app/services/contract/contract.service";
import { AccountComponent } from "../account/account.component";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"]
})
export class TransactionComponent {
  form: FormGroup = new FormGroup({
    to: new FormControl("", [
      Validators.required,
      Validators.minLength(42),
      Validators.maxLength(42),
      Validators.pattern("^0x[a-z0-9]{40}$")
    ]),
    amount: new FormControl(0, [Validators.min(0)])
  });

  valMsgs = {
    to: {
      required: "Destination account is required",
      minlength: "Destination account must have 42 characters",
      maxlength: "Destination account must have 42 characters",
      pattern:
        "Accounts must be prepended with 0x and then contain 40 alphanumeric characters in lowercase (a-z and 0-9)"
    },
    amount: {
      min: "Amount must be positive or 0"
    }
  };

  @ViewChild(AccountComponent, { static: false }) accountComp: AccountComponent;

  constructor(private contract: Web3Service, private router: Router) {}

  reset() {
    this.form.reset();
  }

  transfer() {
    const to = this.form.value.to;
    const amount = this.form.value.amount;

    this.contract.transferEther(to, amount).then(success => {
      console.log("received success", success);
      if (success) this.router.navigate(["/account"]);
    });
  }
}

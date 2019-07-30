import { Component, OnInit, ViewChild } from "@angular/core";
import { ContractService } from "src/app/services/contract/contract.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AccountComponent } from '../account/account.component';

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"]
})
export class TransactionComponent implements OnInit {
  success: boolean;
  compatible: boolean;
  transactionDone: boolean;

  transactionForm: FormGroup;

  validationMessages = {
    sendaddress: {
      required: "The send address is required ",
      pattern: "that´s no looks like a valid address",
      minlength: "a address must have much than 40 characters"
    },
    amount: {
      required: "Need a amount to sent to address",
      pattern: "Only support numbers"
    }
  };

  @ViewChild(AccountComponent, {static: false}) accountComp: AccountComponent;

  constructor(private frb: FormBuilder, private contract: ContractService) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.transactionForm = this.frb.group({
      sendaddress: ["", [Validators.required, Validators.minLength(42)]],
      amount: [
        "",
        [Validators.required, Validators.pattern(/^[+-]?\d+(\.\d+)?$/)]
      ]
    });
    this.transactionForm.valueChanges.subscribe(data =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }

  reset() {
    this.transactionForm.reset();
  }

  transferEth() {
    const address = this.transactionForm.value.sendaddress;
    const amount = this.transactionForm.value.amount;
    console.log(this.accountComp.direction, address, amount);
    this.contract
      .trasnferEther(this.accountComp.direction, address, amount)
      .then(r => {
        this.contract.succes();
        this.transactionForm.reset();
      })
      .catch(() => {
        this.contract.failure("Transaction failed");
      });
  }

  onValueChanged(data?: any) {
    console.log(data);
  }
}

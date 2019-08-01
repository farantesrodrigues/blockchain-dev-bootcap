import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { StoreService } from "../../services";

@Component({
  selector: "app-store-home",
  templateUrl: "./store-home.component.html",
  styleUrls: ["./store-home.component.scss"]
})
export class StoreHomeComponent implements OnInit {
  companyAddress: string;
  stores: string[];
  listStoresCalled = false;

  companyAddressInput = new FormControl("", [
    Validators.required,
    Validators.minLength(42),
    Validators.maxLength(42),
    Validators.pattern("^0x[a-zA-Z0-9]{40}$")
  ]);

  valMsgs = {
    required: "Destination account is required",
    minlength: "Destination account must have 42 characters",
    maxlength: "Destination account must have 42 characters",
    pattern:
      "Accounts must be prepended with 0x and then contain 40 alphanumeric characters in lowercase (a-z, A-Z and 0-9)"
  };

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    const registeredCompany = this.storeService.getRegisteredCompany();
    this.companyAddress = registeredCompany.length && registeredCompany;
  }

  useInputAddress() {
    this.companyAddress = this.companyAddressInput.value;
    this.storeService.registerExistingCompany(this.companyAddressInput.value);
    this.listUserStores();
  }

  listUserStores() {
    this.listStoresCalled = true;
    this.storeService.listUserStores().then(stores => {
      this.stores = stores;
    });
  }

  createCompany() {
    this.storeService.createCompany().then(companyAddress => {
      console.log('companyAddress', companyAddress);
      this.companyAddress = companyAddress;
    });
  }
}

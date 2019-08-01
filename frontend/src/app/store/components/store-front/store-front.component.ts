import { Component, OnInit } from "@angular/core";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";
import { Roles } from "../../models";
import { StoreService } from "../../services";

@Component({
  selector: "app-store-front",
  templateUrl: "./store-front.component.html",
  styleUrls: ["./store-front.component.scss"]
})
export class StoreFrontComponent implements OnInit {
  storeAddress: string;
  storeName: string;
  myUser: { name: string; responsible: string; role: Roles };

  storeNameInput = new FormControl("", [Validators.required]);

  managerInput = new FormGroup({
    name: new FormControl("", [Validators.required]),
    address: new FormControl("", [Validators.required]),
  });

  employeeInput = new FormGroup({
    name: new FormControl("", [Validators.required]),
    address: new FormControl("", [Validators.required]),
  });

  clientInput = new FormGroup({
    name: new FormControl("", [Validators.required]),
    address: new FormControl("", [Validators.required]),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.pipe(first()).subscribe(async params => {
      this.storeAddress = params.address;
      this.storeName = await this.storeService.getStoreName(params.address);
      this.myUser = await this.storeService.getMyUser(params.address);
      console.log(this.storeAddress, this.storeName, this.myUser);
    });
  }

  modifyStoreName() {
    this.storeService.modifyStoreName(this.storeAddress, this.storeNameInput.value).then(async () => {
      this.storeName = await this.storeService.getStoreName(this.storeAddress);
      this.storeNameInput.reset();
    });
  }

  registerManager() {
    const {address, name} = this.managerInput.value;
    this.storeService.registerManager(this.storeAddress, address, name).then(async () => {
      this.managerInput.reset();
    });
  }

  registerEmployee() {
    const {address, name} = this.managerInput.value;
    this.storeService.registerEmployee(this.storeAddress, address, name).then(async () => {
      this.employeeInput.reset();
    });
  }

  registerClient() {
    const {address, name} = this.managerInput.value;
    this.storeService.registerClient(this.storeAddress, address, name).then(async () => {
      this.clientInput.reset();
    });
  }
}

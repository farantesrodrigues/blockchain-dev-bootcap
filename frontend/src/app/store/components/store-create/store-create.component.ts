import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { StoreService } from "../../services";

@Component({
  selector: "app-store-create",
  templateUrl: "./store-create.component.html",
  styleUrls: ["./store-create.component.scss"]
})
export class StoreCreateComponent {
  userName = new FormControl("", [Validators.required]);
  createdAddress: string[] = [];

  constructor(private storeService: StoreService) {}

  create() {
    this.storeService.addStore(this.userName.value).then(store => {
      this.createdAddress.push(store);
      this.userName.reset();
    });
  }
}

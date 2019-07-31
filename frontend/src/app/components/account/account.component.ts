import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../../services/contract/contract.service";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.scss"]
})
export class AccountComponent implements OnInit {
  direction: string;
  balance: string;

  constructor(private contractService: Web3Service) {}

  ngOnInit() {
    this.contractService
      .seeAccountInfo()
      .subscribe(({ originAccount, balance }) => {
        this.direction = originAccount;
        this.balance = balance;
      });
  }

  getAvatarSrc(): string {
    return "https://ui-avatars.com/api/?name=you&length=3&background=0D8ABC&color=fff&size=128";
  }

  getMetamask() {
    window.open("https://metamask.io/", "_blank");
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent {

  constructor(private router: Router) { }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  goToTransaction() {
    this.router.navigate(['/transaction']);
  }

  goToStore() {
    this.router.navigate(['/store']);
  }
}

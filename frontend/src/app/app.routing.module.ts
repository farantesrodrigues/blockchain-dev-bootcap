import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
  HomeComponent,
  TransactionComponent,
  AccountComponent
} from "./components";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    pathMatch: "full",
    data: { name: "home" }
  },
  {
    path: "transaction",
    component: TransactionComponent,
    data: { name: "transaction" }
  },
  { path: "account", component: AccountComponent, data: { name: "account" } },
  {
    path: 'store',
    loadChildren: () => import('./store/store.module').then(mod => mod.StoreModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StoreCreateComponent, StoreFrontComponent, StoreHomeComponent } from "./components";

const routes: Routes = [
  {
    path: "",
    component: StoreHomeComponent
  },
  {
    path: "front/:address",
    component: StoreFrontComponent
  },
  { path: "create", component: StoreCreateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule {}

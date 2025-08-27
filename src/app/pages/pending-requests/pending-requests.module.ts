import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingRequestsComponent } from './pending-requests.component';

const routes: Routes = [
  {
    path: '',
    component: PendingRequestsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingRequestsRoutingModule { }

@NgModule({
  declarations: [],
  imports: [PendingRequestsRoutingModule]
})
export class PendingRequestsModule { }

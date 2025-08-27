import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingPayrollApprovalsComponent } from './pending-payroll-approvals.component';

const routes: Routes = [
  {
    path: '',
    component: PendingPayrollApprovalsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingPayrollApprovalsRoutingModule { }

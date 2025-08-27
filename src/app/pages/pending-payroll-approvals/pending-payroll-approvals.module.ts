import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PendingPayrollApprovalsComponent } from './pending-payroll-approvals.component';

const routes: Routes = [
  {
    path: '',
    component: PendingPayrollApprovalsComponent
  }
];

@NgModule({
  declarations: [
    // PendingPayrollApprovalsComponent is standalone, so it's not declared here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PendingPayrollApprovalsComponent // Import the standalone component
  ]
})
export class PendingPayrollApprovalsModule { }

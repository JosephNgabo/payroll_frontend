import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollComponent } from './payroll.component';
import { ListPayrollsComponent } from './list-payrolls/list-payrolls.component';
import { PayrollDetailsComponent } from './payroll-details/payroll-details.component';

const routes: Routes = [
  { path: '', component: PayrollComponent },
  { path: 'list', component: ListPayrollsComponent },
  { path: 'details/:id', component: PayrollDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { } 
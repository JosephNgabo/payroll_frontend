import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './dashboards/default/default.component';
import { EmployeeManagementModule } from './employee-management/employee-management.module';

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "",
    component: DefaultComponent
  },
  { path: 'dashboard', component: DefaultComponent },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'users', loadChildren: () => import('./ecommerce/access-management.module').then(m => m.AccessManagementModule) },
  { path: 'access-management', loadChildren: () => import('./ecommerce/access-management.module').then(m => m.AccessManagementModule) },
  { path: 'deductions', loadChildren: () => import('./deductions/deductions.module').then(m => m.DeductionsModule) },
  { path: 'employees', loadChildren: () => import('./employee-management/employee-management.module').then(m => m.EmployeeManagementModule) },
  { path: 'allowance-benefits', loadChildren: () => import('./allowance-benefits/allowance-benefits.module').then(m => m.AllowanceBenefitsModule)},
  { path: 'departments', loadChildren: () => import('./department-management/department-management.module').then(m => m.DepartmentManagementModule)},
  { path: 'payroll', loadChildren: () => import('./payroll/payroll.module').then(m => m.PayrollModule)},
  { path: 'time-off-types', loadChildren: () => import('./time-off-types/time-off-types.module').then(m => m.TimeOffTypesModule)},
  { path: 'employee-portal', loadChildren: () => import('./employee-portal/employee-portal.module').then(m => m.EmployeePortalModule)},
  { path: 'pending-requests', loadChildren: () => import('./pending-requests/pending-requests.module').then(m => m.PendingRequestsModule)}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

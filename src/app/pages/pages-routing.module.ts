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
  { path: 'deductions', loadChildren: () => import('./deductions/deductions.module').then(m => m.DeductionsModule) },
  { path: 'employees', loadChildren: () => import('./employee-management/employee-management.module').then(m => m.EmployeeManagementModule) },
  { path: 'allowance-benefits', loadChildren: () => import('./allowance-benefits/allowance-benefits.module').then(m => m.AllowanceBenefitsModule)},
  { path: 'departments', loadChildren: () => import('./department-management/department-management.module').then(m => m.DepartmentManagementModule)},
  { path: 'payroll', loadChildren: () => import('./payroll/payroll.module').then(m => m.PayrollModule)}

  // { path: 'users', redirectTo: 'users/users', pathMatch: 'full' },
  // { path: 'blog', loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule) },
  // { path: 'pages', loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
  // { path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UiModule) },
  // { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  // { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  // { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
  // { path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule) },
  // { path: 'jobs', loadChildren: () => import('./jobs/jobs.module').then(m => m.JobsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

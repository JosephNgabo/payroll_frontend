import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmployeeDashboardComponent } from './dashboard/employee-dashboard.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { LeaveRequestFormComponent } from './leave-management/leave-request-form/leave-request-form.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { EmployeeProfileComponent } from './profile/employee-profile.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeeDashboardComponent },
      { path: 'leave-management', component: LeaveManagementComponent },
      { path: 'leave-request', component: LeaveRequestFormComponent },
      { path: 'payslips', component: PayslipsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'profile', component: EmployeeProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeePortalRoutingModule { }

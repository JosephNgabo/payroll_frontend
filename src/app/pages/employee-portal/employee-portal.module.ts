import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmployeePortalRoutingModule } from './employee-portal-routing.module';

// Components
import { EmployeeDashboardComponent } from './dashboard/employee-dashboard.component';
import { LeaveRequestFormComponent } from './leave-management/leave-request-form/leave-request-form.component';

import { AttendanceComponent } from './attendance/attendance.component';
import { EmployeeProfileComponent } from './profile/employee-profile.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';

// Shared modules and components
import { SharedModule } from '../../shared/shared.module';
import { PagetitleComponent } from '../../shared/ui/pagetitle/pagetitle.component';

@NgModule({
  declarations: [
    EmployeeDashboardComponent,
    LeaveManagementComponent,
    LeaveRequestFormComponent,
    AttendanceComponent,
    EmployeeProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EmployeePortalRoutingModule,
    SharedModule,
    PagetitleComponent
  ],
  exports: [
    EmployeeDashboardComponent
  ]
})
export class EmployeePortalModule { }

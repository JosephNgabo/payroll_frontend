import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeesComponent } from './employees/employees.component';
import { EmployeesViewComponent } from './employees-view/employees-view.component';
import { EmployeeModificationComponent } from './employee-modification/employee-modification.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeeTimeoffComponent } from './employee-details/employee-time-off/employee-timeoff.component';
import { EmployeePersonalComponent } from './employee-details/employee-personal/employee-personal.component';
import { EmployeeJobComponent } from './employee-details/employee-job/employee-job.component';
import { EmployeeBankInfoComponent } from './employee-details/employee-bank-info/employee-bank-info.component';
import { EmployeePayHistoryComponent } from './employee-details/employee-pay-history/employee-pay-history.component';

const routes: Routes = [
    {
        path: '',
        component: EmployeesComponent
    },
    {
        path: 'employees-view',
        component: EmployeesViewComponent
    },
    {
        path: 'employee-modification/:id',
        component: EmployeeModificationComponent
    },
    {
        path: 'employee-details/:id',
        component: EmployeeDetailsComponent,
        children: [
            { path: '', redirectTo: 'personal', pathMatch: 'full' },
            { path: 'timeoff', component: EmployeeTimeoffComponent },
            { path: 'personal', component: EmployeePersonalComponent },
            { path: 'job', component: EmployeeJobComponent },
            { path: 'bankinfo', component: EmployeeBankInfoComponent },
            { path: 'payhistory', component: EmployeePayHistoryComponent },
        ]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { } 
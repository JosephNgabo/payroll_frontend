import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeesComponent } from './employees/employees.component';
import { EmployeesViewComponent } from './employees-view/employees-view.component';
import { EmployeeModificationComponent } from './employee-modification/employee-modification.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';

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
    { path: 'employee-details/:id', component: EmployeeDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { } 
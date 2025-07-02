import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmployeesComponent } from './employees/employees.component';
import { EmployeesViewComponent } from './employees-view/employees-view.component';
import { EmployeeModificationComponent } from './employee-modification/employee-modification.component';

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
        path: 'employee-modification',
        component: EmployeeModificationComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { } 
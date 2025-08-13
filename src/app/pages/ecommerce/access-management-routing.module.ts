import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersComponent } from './users/users.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolesComponent } from './roles/roles.component';
import { RoleDetailsComponent } from './roles/role-details/role-details.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupDetailsComponent } from './groups/group-details.component';

const routes: Routes = [
    {
        path: '',
        component: UsersComponent
    },
    {
        path: 'permissions',
        component: PermissionsComponent
    },
    {
        path: 'roles',
        component: RolesComponent
    },
    {
        path: 'roles/:id',
        component: RoleDetailsComponent
    },
    {
        path: 'groups',
        component: GroupsComponent
    },
    { path: 'groups/:id', component: GroupDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccessManagementRoutingModule { }

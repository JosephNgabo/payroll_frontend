import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AccessManagementRoutingModule } from './access-management-routing.module';
import { UsersComponent } from './users/users.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolesComponent } from './roles/roles.component';
import { RoleDetailsComponent } from './roles/role-details/role-details.component';
import { GroupsComponent } from './groups/groups.component';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { SharedModule } from '../../shared/shared.module';
import { GroupDetailsComponent } from './groups/group-details.component';

@NgModule({
  declarations: [
    UsersComponent,
    PermissionsComponent,
    RolesComponent,
    RoleDetailsComponent,
    GroupsComponent,
    GroupDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbPaginationModule,
    NgApexchartsModule,
    NgSelectModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    AccessManagementRoutingModule,
    PagetitleComponent,
    SharedModule
  ]
})
export class AccessManagementModule { }

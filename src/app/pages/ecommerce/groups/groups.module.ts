import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsComponent } from './groups.component';
import { GroupDetailsComponent } from './group-details.component';

@NgModule({
  declarations: [
    GroupsComponent,
    GroupDetailsComponent,
  ],
  imports: [CommonModule],
})
export class GroupsModule {} 
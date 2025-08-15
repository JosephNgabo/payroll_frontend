import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// UI Components
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { TimeOffTypesComponent } from './time-off-types.component';

// Shared Components
// import { TableSkeletonComponent } from '../../shared/ui/table-skeleton/table-skeleton.component';

// Routes
const routes = [
  {
    path: '',
    component: TimeOffTypesComponent
  }
];

@NgModule({
  declarations: [
    TimeOffTypesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModalModule,
    RouterModule.forChild(routes)
  ]
})
export class TimeOffTypesModule { }

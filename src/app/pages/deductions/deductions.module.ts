import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { DeductionsComponent } from './deductions.component';
import { DeductionsRoutingModule } from './deductions-routing.module';
// import { PageTitleComponent } from '../../shared/ui/page-title/page-title.module';
// import { PaginationModule } from '../../shared/pagination/pagination.module';

@NgModule({
  declarations: [
    DeductionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ToastrModule,
    DeductionsRoutingModule,
    // PageTitleComponent,
    // PaginationModule
  ],
  exports: [
    DeductionsComponent
  ]
})
export class DeductionsModule { } 
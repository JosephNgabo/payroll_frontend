import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { DeductionsComponent } from './deductions.component';
import { DeductionsRoutingModule } from './deductions-routing.module';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { TableSkeletonComponent } from 'src/app/shared/ui/skeleton/table-skeleton.component';
import { OtherDeductionsComponent } from './other-deductions/other-deductions.component';

@NgModule({
  declarations: [
    DeductionsComponent,
    OtherDeductionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ToastrModule,
    DeductionsRoutingModule,
    PagetitleComponent,
    TableSkeletonComponent
  ],
  exports: [
    DeductionsComponent,
    OtherDeductionsComponent
  ]
})
export class DeductionsModule { } 
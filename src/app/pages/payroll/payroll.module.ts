import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollComponent } from './payroll.component';
import { ListPayrollsComponent } from './list-payrolls/list-payrolls.component';
import { PayrollDetailsComponent } from './payroll-details/payroll-details.component';

@NgModule({
  declarations: [
    PayrollComponent,
    ListPayrollsComponent,
    PayrollDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgSelectModule,
    PayrollRoutingModule,
    ScrollingModule
  ],
  exports: [
    PayrollComponent,
    ListPayrollsComponent,
    PayrollDetailsComponent
  ]
})
export class PayrollModule { } 
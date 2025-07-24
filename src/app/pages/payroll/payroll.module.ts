import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollComponent } from './payroll.component';
import { ListPayrollsComponent } from './list-payrolls/list-payrolls.component';
import { PayrollDetailsComponent } from './payroll-details/payroll-details.component';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

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
    ScrollingModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagetitleComponent
  ],
  exports: [
    PayrollComponent,
    ListPayrollsComponent,
    PayrollDetailsComponent
  ]
})
export class PayrollModule { } 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { DefaultComponent } from './default/default.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { StatComponent } from '../../shared/widget/stat/stat.component';
import { TransactionComponent } from '../../shared/widget/transaction/transaction.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DefaultComponent,
    EmployeeDashboardComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    DashboardsRoutingModule,
    SharedModule,
    StatComponent,
    TransactionComponent,
    LoaderComponent
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberFormatPipe } from './pipes/number-format.pipe';
import { DashboardWidgetComponent } from './widget/dashboard-widget/dashboard-widget.component';

@NgModule({
  declarations: [
    NumberFormatPipe,
    DashboardWidgetComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NumberFormatPipe,
    DashboardWidgetComponent
  ]
})
export class SharedModule { } 
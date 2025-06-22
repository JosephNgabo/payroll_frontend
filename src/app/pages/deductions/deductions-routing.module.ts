import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeductionsComponent } from './deductions.component';
import { OtherDeductionsComponent } from './other-deductions/other-deductions.component';

const routes: Routes = [
  {
    path: '',
    component: DeductionsComponent
  },
  {
    path: 'other-deductions',
    component: OtherDeductionsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeductionsRoutingModule { } 
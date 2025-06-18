import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllowancesBenefitsComponent } from './allowances-benefits/allowances-benefits.component';

const routes: Routes = [
    {
        path: '',
        component: AllowancesBenefitsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AllowanceBenefitsRoutingModule { } 
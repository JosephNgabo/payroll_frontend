import { Component, Optional, SkipSelf } from '@angular/core';
import { EmployeeDetailsComponent } from '../employee-details.component';

@Component({
  selector: 'app-employee-personal',
  templateUrl: './employee-personal.component.html',
  styleUrls: ['./employee-personal.component.scss']
})
export class EmployeePersonalComponent {
  constructor(
    @Optional() @SkipSelf() public parent: EmployeeDetailsComponent
  ) {}

  get employee() {
    return this.parent?.employee;
  }
  get getCountryName() {
    return this.parent?.getCountryName.bind(this.parent);
  }
  get getDepartmentName() {
    return this.parent?.getDepartmentName.bind(this.parent);
  }
  get getSalaryBasisLabel() {
    return this.parent?.getSalaryBasisLabel.bind(this.parent);
  }

    get getDeductionName() {
    return this.parent?.getDeductionName.bind(this.parent);
  }
  get getAllowanceName() {
    return this.parent?.getAllowanceName.bind(this.parent);
  }
} 
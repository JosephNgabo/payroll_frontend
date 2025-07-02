import { Component, OnInit } from '@angular/core';

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'Inactive';
  personalMobile: string;
  highestEducation: string;
}

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrl: './employees-view.component.scss'
})
export class EmployeesViewComponent implements OnInit {
  isLoading = true;
  breadCrumbItems: Array<{}>;
  term: string = '';
  saving: boolean = false;
  employeeList: Employee[] = [
    { id: 1, firstname: 'Mugisha', lastname: 'Benjamin', email: 'benjamin.com', department: 'IT', role: 'Developer', status: 'Active', personalMobile: '0788 123 456', highestEducation: 'Bachelor' },
    { id: 2, firstname: 'Ishimwe', lastname: 'Nadia', email: 'nadia.com', department: 'HR', role: 'Manager', status: 'Active', personalMobile: '0788 654 321', highestEducation: 'Master' },
    { id: 3, firstname: 'Muneza', lastname: 'Jackson', email: 'jackson.com', department: 'Finance', role: 'User', status: 'Inactive', personalMobile: '0788 987 654', highestEducation: 'PhD' }
  ];
  filteredEmployeeList: Employee[] = [];

  ngOnInit() {
    this.breadCrumbItems = [
      { label: 'Employee Management' },
      { label: 'Employees', active: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.filteredEmployeeList = this.employeeList;
    }, 1500); // Simulate loading delay
  }

  searchEmployee() {
    if (this.term) {
      const lowerTerm = this.term.toLowerCase();
      this.filteredEmployeeList = this.employeeList.filter(emp =>
        emp.firstname.toLowerCase().includes(lowerTerm) ||
        emp.lastname.toLowerCase().includes(lowerTerm) ||
        emp.email.toLowerCase().includes(lowerTerm) ||
        emp.department.toLowerCase().includes(lowerTerm) ||
        emp.role.toLowerCase().includes(lowerTerm)
      );
    } else {
      this.filteredEmployeeList = this.employeeList;
    }
  }

  onSave() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      // You can add a success alert or notification here
    }, 1500); // Simulate save delay
  }
}

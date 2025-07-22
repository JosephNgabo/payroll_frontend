import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employeeSearch'
})
export class EmployeeSearchPipe implements PipeTransform {
  transform(employees: any[], term: string): any[] {
    if (!term || !employees) return employees;
    const lowerTerm = term.toLowerCase();
    return employees.filter(emp =>
      (emp.first_name && emp.first_name.toLowerCase().includes(lowerTerm)) ||
      (emp.last_name && emp.last_name.toLowerCase().includes(lowerTerm)) ||
      (emp.personal_email && emp.personal_email.toLowerCase().includes(lowerTerm)) ||
      (emp.personal_mobile && emp.personal_mobile.toLowerCase().includes(lowerTerm))
    );
  }
} 
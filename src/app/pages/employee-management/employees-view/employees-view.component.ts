import { Component, OnInit } from '@angular/core';
import { EmployeeInformationService } from 'src/app/core/services/employee-information.service';
import { EmployeeInformation } from 'src/app/core/models/employee-information.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employees-view',
  templateUrl: './employees-view.component.html',
  styleUrls: ['./employees-view.component.scss']
})
export class EmployeesViewComponent implements OnInit {
  employeeList: EmployeeInformation[] = [];
  term = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number = 0;
  lastPage: number = 0;

  constructor(private employeeInformationService: EmployeeInformationService) {}

  ngOnInit() {
    this.fetchEmployees(1);
  }

  onPageChange(event: any) {
    const page = event.page || event;
    this.fetchEmployees(page);
  }

  fetchEmployees(page: number) {
    this.employeeInformationService.getEmployees(page)
      .subscribe({
        next: (res) => {
          this.employeeList = res.data;
          this.currentPage = res.current_page;
          this.itemsPerPage = res.per_page;
          this.totalItems = res.total;
          this.lastPage = res.last_page;
        },
        error: (err) => {
          console.error('API error:', err);
        }
      });
  }

  onDelete(emp: EmployeeInformation) {
    console.log('Deleting employee:', emp);
    if (!emp || !emp.id) return;
    const empName = (emp as any).name || (emp as any).full_name ||
      ((emp as any).first_name && (emp as any).last_name
        ? `${(emp as any).first_name} ${(emp as any).last_name}`
        : 'Unknown');
    Swal.fire({
      title: 'Are you sure?',
      html: `This action will permanently delete the employee: <b>${empName}</b>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeInformationService.deleteEmployee(emp.id).subscribe({
          next: () => {
            this.employeeList = this.employeeList.filter(e => e.id !== emp.id);
            this.totalItems--;
            Swal.fire('Deleted!', `Employee <b>${empName}</b> has been deleted.`, 'success');
          },
          error: (err) => {
            console.error('Failed to delete employee:', err);
            Swal.fire('Error', 'Failed to delete employee.', 'error');
          }
        });
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { EmployeeInformationService } from 'src/app/core/services/employee-information.service';
import { EmployeeInformation } from 'src/app/core/models/employee-information.model';

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
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeeInformationService } from 'src/app/core/services/employee-information.service';
import { EmployeeInformation } from 'src/app/core/models/employee-information.model';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DepartmentService } from 'src/app/core/services/department.service';
import { EmployeeContractService } from 'src/app/core/services/employee-contract.service';
import { Department } from 'src/app/core/models/department.model';

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

  departmentsMap: { [id: string]: string } = {};
  departmentOptions: string[] = [];

  @ViewChild('statusModal') statusModal: any;
  selectedEmployee: any = null;
  selectedStatus: number | null = null;
  showStatusModal = false;

  selectedDepartment: string | null = null;
  selectedStatusFilter: number | null = null;

  isLoading = true;

  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '30', value: 30 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: 'All', value: 10000 }
  ];

  // Permission system - using existing p_id approach
  permissions: number[] = [];

  constructor(
    private employeeInformationService: EmployeeInformationService,
    private modalService: NgbModal,
    private departmentService: DepartmentService,
    private employeeContractService: EmployeeContractService
  ) {
    // Get permissions from session storage (same as sidebar)
    const user = sessionStorage.getItem('current_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.permissions = userData.permissions || [];
      } catch (e) {
        console.error('Error parsing user permissions:', e);
        this.permissions = [];
      }
    }
  }

  ngOnInit() {
    this.loadDepartmentsAndEmployees();
  }

  // Permission check methods using p_id system for Employee Management
  canViewEmployees(): boolean {
    return this.permissions.includes(6005); // p_id for view_employees
  }

  canCreateEmployee(): boolean {
    return this.permissions.includes(6006); // p_id for create_employee
  }

  canUpdateEmployee(): boolean {
    return this.permissions.includes(6007); // p_id for update_employee
  }

  canDeleteEmployee(): boolean {
    return this.permissions.includes(6008); // p_id for delete_employee
  }

  canViewEmployeeDetails(): boolean {
    return this.permissions.includes(6009); // p_id for view_employee_details
  }

  // Check if user has any employee management permissions
  hasAnyEmployeePermission(): boolean {
    return this.permissions.some(p_id => [6005, 6006, 6007, 6008, 6009].includes(p_id));
  }

  get filteredEmployees() {
    return this.employeeList.filter(emp => {
      const matchesDepartment = this.selectedDepartment ? (emp as any).department === this.selectedDepartment : true;
      let matchesStatus = true;
      if (this.selectedStatusFilter !== null && this.selectedStatusFilter !== undefined) {
        matchesStatus = Number((emp as any).status) === Number(this.selectedStatusFilter);
      }
      return matchesDepartment && matchesStatus;
    });
  }

  get paginatedEmployees() {
    const filtered = this.filteredEmployees;
    if (this.itemsPerPage === 0) return filtered; // Show all
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  statusOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
    { value: 3, label: 'Terminated' },
    { value: 4, label: 'Resigned' },
    { value: 5, label: 'Retired' },
    { value: 6, label: 'Probation' },
    { value: 7, label: 'On Leave' },
    { value: 8, label: 'Suspended' },
    { value: 9, label: 'Pending Activation' }
  ];

  loadDepartmentsAndEmployees() {
    this.isLoading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departmentsMap = {};
        departments.forEach(dep => {
          this.departmentsMap[dep.id] = dep.name;
        });
        this.fetchEmployees(1);
      },
      error: (err) => {
        console.error('Failed to load departments', err);
        this.departmentsMap = {};
        this.fetchEmployees(1);
      }
    });
  }

  onPageChange(event: any) {
    const page = event.page || event;
    this.fetchEmployees(page);
  }

  onPageSizeChange(event: any) {
    if (event && event.value === 'all') {
      this.itemsPerPage = this.totalItems;
    } else if (event && event.value) {
      this.itemsPerPage = event.value;
    }
    this.currentPage = 1;
  }

  fetchEmployees(page: number) {
    this.isLoading = true;
    this.employeeInformationService.getEmployees(page)
      .subscribe({
        next: (res) => {
          this.employeeList = res.data;
          this.currentPage = res.current_page;
          this.itemsPerPage = res.per_page;
          this.totalItems = res.total;
          this.lastPage = res.last_page;
          let contractsFetched = 0;
          const total = this.employeeList.length;
          if (total === 0) {
            this.isLoading = false;
            this.updateDepartmentOptions();
            return;
          }
          this.employeeList.forEach(emp => {
            this.employeeContractService.getContract(emp.id!).subscribe({
              next: (contract: any) => {
                let contractObj = contract;
                if (contract && contract.data) contractObj = contract.data;
                if (Array.isArray(contractObj) && contractObj.length > 0) contractObj = contractObj[0];
                let departmentId = contractObj && contractObj.department;
                if (departmentId && typeof departmentId === 'object') departmentId = departmentId.id;
                if (departmentId) {
                  (emp as any).department = this.departmentsMap[departmentId] || 'Unknown';
                } else {
                  (emp as any).department = 'Unknown';
                }
                contractsFetched++;
                if (contractsFetched === total) {
                  this.isLoading = false;
                  this.updateDepartmentOptions();
                }
              },
              error: () => {
                (emp as any).department = 'Unknown';
                contractsFetched++;
                if (contractsFetched === total) {
                  this.isLoading = false;
                  this.updateDepartmentOptions();
                }
              }
            });
          });
        },
        error: (err) => {
          console.error('API error:', err);
          this.isLoading = false;
        }
      });
  }

  updateDepartmentOptions() {
    this.departmentOptions = Object.values(this.departmentsMap).filter(dep => dep && dep !== 'Unknown');
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

  openStatusModal(emp: any) {
    this.selectedEmployee = emp;
    this.selectedStatus = emp.status || null;
    this.modalService.open(this.statusModal, { centered: true });
  }

  closeStatusModal() {
    this.showStatusModal = false;
  }

  saveStatus() {
    if (!this.selectedEmployee || !this.selectedEmployee.id || !this.selectedStatus) {
      Swal.fire('Error', 'Invalid employee or status.', 'error');
      return;
    }
    this.employeeInformationService.updateEmployeeStatus(this.selectedEmployee.id, this.selectedStatus).subscribe({
      next: (res) => {
        // Update the status in the local list
        const idx = this.employeeList.findIndex(e => e.id === this.selectedEmployee.id);
        if (idx !== -1) {
          (this.employeeList[idx] as any).status = this.selectedStatus;
        }
        Swal.fire('Success', 'Employee status updated successfully.', 'success');
        this.modalService.dismissAll();
      },
      error: (err) => {
        Swal.fire('Error', err || 'Failed to update employee status.', 'error');
      }
    });
  }

  getStatusLabel(status: number | null | undefined): string {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Terminated';
      case 4: return 'Resigned';
      case 5: return 'Retired';
      case 6: return 'Probation';
      case 7: return 'On Leave';
      case 8: return 'Suspended';
      case 9: return 'Pending Activation';
      default: return 'Unknown';
    }
  }

  getStatusBadgeClass(status: number | null | undefined): string {
    switch (status) {
      case 1: return 'badge bg-success'; // Active - green
      case 2: return 'badge bg-secondary'; // Inactive - gray
      case 3: return 'badge bg-danger'; // Terminated - red
      case 4: return 'badge bg-warning text-dark'; // Resigned - yellow
      case 5: return 'badge bg-info text-dark'; // Retired - light blue
      case 6: return 'badge bg-primary'; // Probation - blue
      case 7: return 'badge bg-warning text-dark'; // On Leave - yellow
      case 8: return 'badge bg-danger'; // Suspended - red
      case 9: return 'badge bg-secondary'; // Pending Activation - gray
      default: return 'badge bg-light text-dark';
    }
  }

  clearAllFilters() {
    this.term = '';
    this.selectedDepartment = null;
    this.selectedStatusFilter = null;
  }
}

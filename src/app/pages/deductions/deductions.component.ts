import { Component, OnInit } from '@angular/core';
import { DeductionsService } from '../../core/services/deductions.service';
import { RssbDeduction, PaginatedRssbDeductions } from '../../core/models/rssb-deduction.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-deductions',
  templateUrl: './deductions.component.html',
  styleUrls: ['./deductions.component.scss']
})
export class DeductionsComponent implements OnInit {
  deductions: RssbDeduction[] = [];
  paginatedData: PaginatedRssbDeductions | null = null;
  isLoading = false;
  error: string | null = null;
  term: string = '';
  breadCrumbItems: Array<{}> = [
    { label: 'Configuration' },
    { label: 'RSSB Deductions', active: true }
  ];
  selectedDeduction: RssbDeduction | null = null;
  modalRef: any;

  // Permission system - using existing p_id approach
  permissions: (number | string)[] = [];

  constructor(
    private deductionsService: DeductionsService,
    private modalService: NgbModal
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

  ngOnInit(): void {
    this.loadDeductions();
  }

  loadDeductions(page: number = 1) {
    this.isLoading = true;
    this.error = null;
    this.deductionsService.getRssbDeductions(page).subscribe({
      next: (data) => {
        this.paginatedData = data;
        this.deductions = data.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load RSSB deductions. Please try again later.';
        this.isLoading = false;
        console.error('Error loading RSSB deductions:', error);
      }
    });
  }

  searchDeductions() {
    if (!this.term) {
      this.deductions = this.paginatedData ? [...this.paginatedData.data] : [];
      return;
    }
    const lowerTerm = this.term.toLowerCase();
    this.deductions = (this.paginatedData ? this.paginatedData.data : []).filter(deduction =>
      deduction.rssb_name.toLowerCase().includes(lowerTerm) ||
      deduction.rssb_description.toLowerCase().includes(lowerTerm)
    );
  }

  openViewModal(content: any, deduction: RssbDeduction) {
    this.selectedDeduction = deduction;
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  // Permission check methods using p_id system for RSSB Deductions
  canViewRssbDeductions(): boolean {
    return this.permissions.some(p_id => p_id === 3001 || p_id === '3001'); // p_id for view_rssb_deductions
  }

  canCreateRssbDeduction(): boolean {
    return this.permissions.some(p_id => p_id === 3002 || p_id === '3002'); // p_id for create_rssb_deduction
  }

  canUpdateRssbDeduction(): boolean {
    return this.permissions.some(p_id => p_id === 3003 || p_id === '3003'); // p_id for update_rssb_deduction
  }

  canDeleteRssbDeduction(): boolean {
    return this.permissions.some(p_id => p_id === 3004 || p_id === '3004'); // p_id for delete_rssb_deduction
  }

  // Check if user has any RSSB deduction management permissions
  hasAnyRssbDeductionPermission(): boolean {
    const rssbPermissionIds = [3001, 3002, 3003, 3004, '3001', '3002', '3003', '3004'];
    return this.permissions.some(p_id => rssbPermissionIds.includes(p_id));
  }
} 
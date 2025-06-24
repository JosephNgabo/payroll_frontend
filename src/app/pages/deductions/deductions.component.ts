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

  constructor(
    private deductionsService: DeductionsService,
    private modalService: NgbModal
  )      
    
   {}

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
} 
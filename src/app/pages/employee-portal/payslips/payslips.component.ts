import { Component, OnInit } from '@angular/core';

interface Payslip {
  id: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  status: 'available' | 'processing' | 'pending';
}

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  payslips: Payslip[] = [
    {
      id: '1',
      month: 'December',
      year: 2024,
      grossSalary: 500000,
      netSalary: 450000,
      deductions: 50000,
      status: 'available'
    },
    {
      id: '2',
      month: 'November',
      year: 2024,
      grossSalary: 500000,
      netSalary: 450000,
      deductions: 50000,
      status: 'available'
    },
    {
      id: '3',
      month: 'October',
      year: 2024,
      grossSalary: 500000,
      netSalary: 450000,
      deductions: 50000,
      status: 'available'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Payslips', active: true }
    ];
  }

  downloadPayslip(payslip: Payslip): void {
    console.log('Downloading payslip:', payslip);
  }

  viewPayslip(payslip: Payslip): void {
    console.log('Viewing payslip:', payslip);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-success';
      case 'processing':
        return 'bg-warning';
      case 'pending':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
}


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Deduction {
  state?: boolean;
  id?: number;
  name: string;
  description: string;
  isTaxApplied: boolean;
  taxPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeductionsService {
  private apiUrl = `${environment.apiUrl}/deductions`;

  constructor(private http: HttpClient) { }

  // Dummy data for testing
  private dummyDeductions: Deduction[] = [
    {
      id: 1,
      name: 'Health Insurance',
      description: 'Monthly health insurance premium',
      isTaxApplied: false,
      taxPercentage: 0
    },
    {
      id: 2,
      name: '401K Contribution',
      description: 'Pre-tax retirement savings',
      isTaxApplied: true,
      taxPercentage: 10
    },
    {
      id: 3,
      name: 'Student Loan',
      description: 'Repayment for student loans',
      isTaxApplied: false,
      taxPercentage: 0
    }
  ];

  getDeductions(): Observable<Deduction[]> {
    // Return dummy data instead of making an HTTP call
    return of(this.dummyDeductions);
  }

  getDeduction(id: number): Observable<Deduction> {
    const deduction = this.dummyDeductions.find(d => d.id === id);
    return of(deduction as Deduction);
  }

  createDeduction(deduction: Deduction): Observable<Deduction> {
    // Simulate adding a new deduction by assigning a dummy ID
    const newId = Math.max(...this.dummyDeductions.map(d => d.id || 0)) + 1;
    const newDeduction = { ...deduction, id: newId };
    this.dummyDeductions.push(newDeduction);
    return of(newDeduction);
  }

  updateDeduction(id: number, deduction: Deduction): Observable<Deduction> {
    // Simulate updating an existing deduction
    const index = this.dummyDeductions.findIndex(d => d.id === id);
    if (index > -1) {
      this.dummyDeductions[index] = { ...deduction, id: id };
      return of(this.dummyDeductions[index]);
    }
    return of(deduction);
  }

  deleteDeduction(id: number): Observable<void> {
    // Simulate deleting a deduction
    this.dummyDeductions = this.dummyDeductions.filter(d => d.id !== id);
    return of(undefined);
  }
} 
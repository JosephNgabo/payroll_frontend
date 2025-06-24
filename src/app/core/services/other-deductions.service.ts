import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OtherDeduction, PaginatedOtherDeductions } from '../models/other-deduction.model';

export interface CreateOtherDeductionDto {
  name: string;
  description: string;
  has_tax: number;
  rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class OtherDeductionsService {
  private apiUrl = `${environment.apiUrl}/other-deductions`;

  constructor(private http: HttpClient) { }

  getOtherDeductions(page: number = 1): Observable<PaginatedOtherDeductions> {
    return this.http.get<PaginatedOtherDeductions>(`${this.apiUrl}?page=${page}`);
  }

  createOtherDeduction(payload: CreateOtherDeductionDto): Observable<OtherDeduction> {
    return this.http.post<OtherDeduction>(this.apiUrl, payload);
  }

  updateOtherDeduction(id: string, payload: CreateOtherDeductionDto): Observable<OtherDeduction> {
    return this.http.put<OtherDeduction>(`${this.apiUrl}/${id}`, payload);
  }

  deleteOtherDeduction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
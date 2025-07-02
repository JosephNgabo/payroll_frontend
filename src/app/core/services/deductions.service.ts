import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RssbDeduction, PaginatedRssbDeductions } from '../models/rssb-deduction.model';

@Injectable({
  providedIn: 'root'
})
export class DeductionsService {
  private apiUrl = `${environment.apiUrl}/rssb-deductions`;

  constructor(private http: HttpClient) { }

  getRssbDeductions(page: number = 1): Observable<PaginatedRssbDeductions> {
    return this.http.get<PaginatedRssbDeductions>(`${this.apiUrl}?page=${page}`);
  }
} 
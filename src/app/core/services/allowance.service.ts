import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allowance } from '../models/allowance.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AllowanceService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllowances(): Observable<Allowance[]> {
    return this.http.get<Allowance[]>(`${this.API_URL}/allowance`);
  }

  createAllowance(data: Partial<Allowance>): Observable<Allowance> {
    return this.http.post<Allowance>(`${this.API_URL}/allowance`, data);
  }

  updateAllowance(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/allowance/${id}`, data);
  }

  deleteAllowance(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/allowance/${id}`);
  }
}

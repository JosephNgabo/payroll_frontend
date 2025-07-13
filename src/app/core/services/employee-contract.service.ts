import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeContract } from '../models/employee-contract.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeContractService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createContract(employeeId: string, contract: EmployeeContract): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-contract/${employeeId}`, contract);
  }

  updateContract(contractId: string, contract: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-contract/${contractId}`, contract);
  }

  getContract(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee-contract/${employeeId}`);
  }
} 
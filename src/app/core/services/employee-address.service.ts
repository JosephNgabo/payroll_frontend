import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeAddress } from '../models/employee-address.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAddressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeAddress(employeeId: string, address: EmployeeAddress): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-addresses/${employeeId}`, address);
  }

  updateEmployeeAddress(addressId: string, address: EmployeeAddress): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-addresses/${addressId}`, address);
  }

  getEmployeeAddresses(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee-addresses/${employeeId}`);
  }
} 
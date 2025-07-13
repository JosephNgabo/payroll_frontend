import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeEmergencyContact } from '../models/employee-emergency-contact.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeEmergencyContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeEmergencyContact(employeeId: string, contact: EmployeeEmergencyContact): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee-emergency-contacts/${employeeId}`, contact);
  }

  getEmployeeEmergencyContacts(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee-emergency-contacts/${employeeId}`);
  }

  updateEmployeeEmergencyContact(contactId: string, contact: EmployeeEmergencyContact): Observable<any> {
    return this.http.put(`${this.apiUrl}/employee-emergency-contacts/${contactId}`, contact);
  }
} 
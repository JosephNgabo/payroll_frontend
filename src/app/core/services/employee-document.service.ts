import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeDocument } from '../models/employee-document.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEmployeeDocument(employeeId: string, document: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees-documents/${employeeId}`, document);
  }

  getEmployeeDocuments(employeeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/employees-documents/${employeeId}`);
  }

  updateEmployeeDocument(documentId: string, document: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees-documents/${documentId}`, document);
  }

  getDocumentTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/document-types`);
  }
} 
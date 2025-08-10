import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Department } from '../models/department.model';
import { environment } from '../../../environments/environment';
import { map, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly API_URL = `${environment.apiUrl}/departments`;

  // Mock data for development until backend is ready
  private mockDepartments: Department[] = [
    {
      id: '1',
      name: 'Human Resources',
      description: 'Manages employee relations, recruitment, and HR policies'
    },
    {
      id: '2', 
      name: 'Finance',
      description: 'Handles financial planning, budgeting, and accounting operations'
    },
    {
      id: '3',
      name: 'Information Technology',
      description: 'Manages IT infrastructure, software development, and technical support'
    },
    {
      id: '4',
      name: 'Marketing',
      description: 'Responsible for brand management, advertising, and market research'
    },
    {
      id: '5',
      name: 'Operations',
      description: 'Oversees day-to-day business operations and process optimization'
    }
  ];

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    // Use mock data for now - comment this out when backend is ready
    return of(this.mockDepartments).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.get<any>(this.API_URL).pipe(
    //   map(response =>
    //     response.data.map((d: any) => ({
    //       id: d.id,
    //       name: d.department_name,
    //       description: d.department_description
    //     }) as Department)
    //   )
    // );
  }

  getDepartment(id: string): Observable<Department> {
    // Use mock data for now
    const dept = this.mockDepartments.find(d => d.id === id);
    if (dept) {
      return of(dept).pipe(delay(300));
    }
    return of(null as any);
    
    // Uncomment when backend is ready:
    // return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
    //   map(d => ({
    //     id: d.id,
    //     name: d.department_name,
    //     description: d.department_description
    //   }) as Department)
    // );
  }

  createDepartment(payload: { department_name: string; department_description: string }): Observable<Department> {
    // Use mock data for now
    const newDept: Department = {
      id: (this.mockDepartments.length + 1).toString(),
      name: payload.department_name,
      description: payload.department_description
    };
    this.mockDepartments.push(newDept);
    return of(newDept).pipe(delay(500));
    
    // Uncomment when backend is ready:
    // return this.http.post<any>(this.API_URL, payload).pipe(
    //   map(d => ({
    //     id: d.data.id,
    //     name: d.data.department_name,
    //     description: d.data.department_description
    //   }) as Department)
    // );
  }

  updateDepartment(id: string, department: { name?: string; description?: string }): Observable<Department> {
    // Use mock data for now
    const index = this.mockDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
      if (department.name) this.mockDepartments[index].name = department.name;
      if (department.description) this.mockDepartments[index].description = department.description;
      return of(this.mockDepartments[index]).pipe(delay(500));
    }
    return of(null as any);
    
    // Uncomment when backend is ready:
    // const payload: any = {};
    // if (department.name !== undefined) payload.department_name = department.name;
    // if (department.description !== undefined) payload.department_description = department.description;
    // return this.http.put<any>(`${this.API_URL}/${id}`, payload).pipe(
    //   map(d => ({
    //     id: d.data.id,
    //     name: d.data.department_name,
    //     description: d.data.department_description
    //   }) as Department)
    // );
  }

  deleteDepartment(id: string): Observable<any> {
    // Use mock data for now
    const index = this.mockDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
      this.mockDepartments.splice(index, 1);
    }
    return of({ success: true }).pipe(delay(300));
    
    // Uncomment when backend is ready:
    // return this.http.delete(`${this.API_URL}/${id}`);
  }

  // Test method to check available endpoints
  testEndpoints(): Observable<any> {
    const endpoints = [
      `${environment.apiUrl}/departments`,
      `${environment.apiUrl}/department`,
      `${environment.apiUrl}/departement`,
      `${environment.apiUrl}/department-management`
    ];
    
    console.log('Testing department endpoints:', endpoints);
    
    // Try the first endpoint
    return this.http.get(endpoints[0]);
  }
} 
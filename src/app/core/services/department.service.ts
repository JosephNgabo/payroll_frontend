import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/department.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly API_URL = `${environment.apiUrl}/departement`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(response =>
        response.data.map((d: any) => ({
          id: d.id,
          name: d.department_name,
          description: d.department_description
        }) as Department)
      )
    );
  }

  getDepartment(id: string): Observable<Department> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(d => ({
        id: d.id,
        name: d.department_name,
        description: d.department_description
      }) as Department)
    );
  }

  createDepartment(payload: { department_name: string; department_description: string }): Observable<Department> {
    return this.http.post<any>(this.API_URL, payload).pipe(
      map(d => ({
        id: d.data.id,
        name: d.data.department_name,
        description: d.data.department_description
      }) as Department)
    );
  }

  updateDepartment(id: string, department: { name?: string; description?: string }): Observable<Department> {
    const payload: any = {};
    if (department.name !== undefined) payload.department_name = department.name;
    if (department.description !== undefined) payload.department_description = department.description;
    return this.http.put<any>(`${this.API_URL}/${id}`, payload).pipe(
      map(d => ({
        id: d.data.id,
        name: d.data.department_name,
        description: d.data.department_description
      }) as Department)
    );
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
} 
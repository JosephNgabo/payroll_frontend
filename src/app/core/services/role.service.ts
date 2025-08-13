import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedRolesResponse, Role, CreateRolePayload, UpdateRolePayload, RoleDetailResponse, RolePermission } from '../models/role.model';
import { LaravelAuthService } from './laravel-auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) {}

  /**
   * Get a paginated list of roles
   * @param page The page number to fetch
   */
  getRoles(page: number = 1): Observable<PaginatedRolesResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<PaginatedRolesResponse>(`${this.API_URL}/roles?page=${page}`, { headers });
  }

  /**
   * Create a new role
   * @param roleData The data for the new role
   */
  createRole(roleData: CreateRolePayload): Observable<Role> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Role>(`${this.API_URL}/roles`, roleData, { headers });
  }

  /**
   * Update an existing role
   * @param id The role ID to update
   * @param roleData The updated role data
   */
  updateRole(id: string, roleData: UpdateRolePayload): Observable<Role> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<Role>(`${this.API_URL}/roles/${id}`, roleData, { headers });
  }

  /**
   * Delete a role by ID
   */
  deleteRole(id: number | string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/roles/${id}`, { headers });
  }

  /**
   * Get a single role by ID with detailed permissions
   */
  getRole(id: string): Observable<RoleDetailResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RoleDetailResponse>(`${this.API_URL}/roles/${id}`, { headers });
  }

  /**
   * Get permissions for a specific role
   * @param roleId The role ID to get permissions for
   */
  getRolePermissions(roleId: string): Observable<{ status: boolean; message: string; data: RolePermission[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ status: boolean; message: string; data: RolePermission[] }>(`${this.API_URL}/roles/${roleId}/permissions`, { headers });
  }

  /**
   * Get users assigned to a specific role
   * @param roleId The role ID to get users for
   */
  getRoleUsers(roleId: string): Observable<{ status: boolean; message: string; data: any[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ status: boolean; message: string; data: any[] }>(`${this.API_URL}/roles/${roleId}/users`, { headers });
  }
} 
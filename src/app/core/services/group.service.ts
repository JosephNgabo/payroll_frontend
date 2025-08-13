import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  PaginatedGroupsResponse, 
  Group, 
  CreateGroupPayload, 
  UpdateGroupPayload, 
  GroupDetailResponse,
  GroupRole,
  GroupUser,
  GroupPermission
} from '../models/group.model';
import { LaravelAuthService } from './laravel-auth.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) {}

  /**
   * Get all groups with pagination
   */
  getGroups(page: number = 1): Observable<PaginatedGroupsResponse> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/groups?page=${page}`;
    
    console.log('🔍 Fetching groups from:', url);
    
    return this.http.get<PaginatedGroupsResponse>(url, { headers }).pipe(
      tap(response => {
        console.log('✅ Groups fetched successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error fetching groups:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new group
   */
  createGroup(groupData: CreateGroupPayload): Observable<{ status: boolean; message: string; data: Group }> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/groups`;
    
    console.log('➕ Creating new group');
    console.log('📦 Payload:', groupData);
    console.log('🌐 URL:', url);
    
    return this.http.post<{ status: boolean; message: string; data: Group }>(url, groupData, { headers }).pipe(
      tap(response => {
        console.log('✅ Group created successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error creating group:', error);
        console.error('📋 Error details:', {
          status: error.status,
          message: error.error?.message,
          errors: error.error?.errors,
          exception: error.error?.exception
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing group
   */
  updateGroup(id: string, groupData: UpdateGroupPayload): Observable<{ status: boolean; message: string; data: Group }> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/groups/${id}`;
    
    console.log('✏️ Updating group:', id);
    console.log('📦 Payload:', groupData);
    console.log('🌐 URL:', url);
    
    return this.http.put<{ status: boolean; message: string; data: Group }>(url, groupData, { headers }).pipe(
      tap(response => {
        console.log('✅ Group updated successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error updating group:', error);
        console.error('📋 Error details:', {
          status: error.status,
          message: error.error?.message,
          errors: error.error?.errors,
          exception: error.error?.exception
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a group by ID
   */
  deleteGroup(id: number | string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/groups/${id}`, { headers });
  }

  /**
   * Get a specific group by ID
   * @param id The group ID
   */
  getGroup(id: string): Observable<GroupDetailResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<GroupDetailResponse>(`${this.API_URL}/groups/${id}`, { headers });
  }

  /**
   * Assign a single role to a group
   * @param groupId The group ID
   * @param roleId The role ID to assign
   */
  assignRoleToGroup(groupId: string, roleId: string): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<{ status: boolean; message: string; data: any }>(
      `${this.API_URL}/groups/${groupId}/assign-roles`,
      { role_id: roleId }, // Send as singular
      { headers }
    );
  }

  /**
   * Assign multiple roles to a group
   * @param groupId The group ID
   * @param roleIds Array of role IDs to assign
   */
  assignRolesToGroup(groupId: string, roleIds: string[]): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/groups/${groupId}/assign-roles`;
    const payload = { role_id: roleIds[0] }; // Send first role only for now
    
    console.log('🔗 Assigning roles to group:', groupId);
    console.log('📦 Payload:', payload);
    console.log('🌐 URL:', url);
    
    return this.http.post<{ status: boolean; message: string; data: any }>(url, payload, { headers }).pipe(
      tap(response => {
        console.log('✅ Roles assigned successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error assigning roles:', error);
        console.error('📋 Error details:', {
          status: error.status,
          message: error.error?.message,
          errors: error.error?.errors,
          exception: error.error?.exception
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Assign a single user to a group
   * @param groupId The group ID
   * @param userId The user ID to assign
   */
  assignUserToGroup(groupId: string, userId: string): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<{ status: boolean; message: string; data: any }>(
      `${this.API_URL}/groups/${groupId}/assign-users`,
      { user_id: userId }, // Send as singular
      { headers }
    );
  }

  /**
   * Assign multiple users to a group
   * @param groupId The group ID
   * @param userIds Array of user IDs to assign
   */
  assignUsersToGroup(groupId: string, userIds: string[]): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    const url = `${this.API_URL}/groups/${groupId}/assign-users`;
    const payload = { user_id: userIds[0] }; // Send first user only for now
    
    console.log('👥 Assigning users to group:', groupId);
    console.log('📦 Payload:', payload);
    console.log('🌐 URL:', url);
    
    return this.http.post<{ status: boolean; message: string; data: any }>(url, payload, { headers }).pipe(
      tap(response => {
        console.log('✅ Users assigned successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error assigning users:', error);
        console.error('📋 Error details:', {
          status: error.status,
          message: error.error?.message,
          errors: error.error?.errors,
          exception: error.error?.exception
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove a role from a group
   * @param groupId The group ID
   * @param roleId The role ID to remove
   */
  removeRoleFromGroup(groupId: string, roleId: string): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<{ status: boolean; message: string; data: any }>(
      `${this.API_URL}/groups/${groupId}/roles/${roleId}`,
      { headers }
    );
  }

  /**
   * Remove a user from a group
   * @param groupId The group ID
   * @param userId The user ID to remove
   */
  removeUserFromGroup(groupId: string, userId: string): Observable<{ status: boolean; message: string; data: any }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<{ status: boolean; message: string; data: any }>(
      `${this.API_URL}/groups/${groupId}/users/${userId}`,
      { headers }
    );
  }

  /**
   * Get roles for a specific group
   * @param groupId The group ID to get roles for
   */
  getGroupRoles(groupId: string): Observable<{ status: boolean; message: string; data: GroupRole[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ status: boolean; message: string; data: GroupRole[] }>(`${this.API_URL}/groups/${groupId}/roles`, { headers });
  }

  /**
   * Get users for a specific group
   * @param groupId The group ID to get users for
   */
  getGroupUsers(groupId: string): Observable<{ status: boolean; message: string; data: GroupUser[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ status: boolean; message: string; data: GroupUser[] }>(`${this.API_URL}/groups/${groupId}/users`, { headers });
  }

  /**
   * Get permissions for a specific group
   * @param groupId The group ID to get permissions for
   */
  getGroupPermissions(groupId: string): Observable<{ status: boolean; message: string; data: GroupPermission[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ status: boolean; message: string; data: GroupPermission[] }>(`${this.API_URL}/groups/${groupId}/permissions`, { headers });
  }

  /**
   * Assign permissions to a group
   * @param groupId The group ID
   * @param permissionIds Array of permission IDs to assign
   */
  assignPermissionsToGroup(groupId: string, permissionIds: string[]): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.API_URL}/groups/${groupId}/permissions`, { permissions: permissionIds }, { headers });
  }

  /**
   * Remove roles from a group
   * @param groupId The group ID
   * @param roleIds Array of role IDs to remove
   */
  removeRolesFromGroup(groupId: string, roleIds: string[]): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/groups/${groupId}/roles`, { 
      headers, 
      body: { roles: roleIds } 
    });
  }

  /**
   * Remove users from a group
   * @param groupId The group ID
   * @param userIds Array of user IDs to remove
   */
  removeUsersFromGroup(groupId: string, userIds: string[]): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/groups/${groupId}/users`, { 
      headers, 
      body: { users: userIds } 
    });
  }

  /**
   * Remove permissions from a group
   * @param groupId The group ID
   * @param permissionIds Array of permission IDs to remove
   */
  removePermissionsFromGroup(groupId: string, permissionIds: string[]): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.API_URL}/groups/${groupId}/permissions`, { 
      headers, 
      body: { permissions: permissionIds } 
    });
  }
} 
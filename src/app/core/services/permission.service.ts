import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PermissionsResponse } from '../models/permission.model';
import { LaravelAuthService } from './laravel-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) {}

  /**
   * Get all permissions with categories
   */
  getPermissions(): Observable<PermissionsResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<PermissionsResponse>(`${this.API_URL}/permissions`, { headers });
  }

  /**
   * Get current user's permissions based on user profile
   * Simple implementation for now
   */
  getCurrentUserPermissions(): Observable<string[]> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.log('🚫 PermissionService - No current user found');
      return of([]);
    }

    console.log('👤 PermissionService - Getting permissions for user:', {
      username: currentUser.username,
      userProfile: currentUser.user_profile,
      email: currentUser.email
    });

    // For admin users, we'll return all permissions
    if (currentUser.user_profile === 'admin') {
      console.log('👑 PermissionService - Admin user detected, returning all permissions');
      return this.getAllPermissionNames();
    }

    // Use profile-based permissions for regular users
    console.log('📋 PermissionService - Regular user, using profile-based permissions');
    return this.getBasicUserPermissions(currentUser.user_profile);
  }

  /**
   * Get all permission names (for admin users)
   */
  private getAllPermissionNames(): Observable<string[]> {
    return this.getPermissions().pipe(
      map(response => {
        const allPermissions: string[] = [];
        response.data.forEach(category => {
          category.permissions.forEach(permission => {
            allPermissions.push(permission.name);
          });
        });
        return allPermissions;
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get basic permissions for regular users
   * Based on the user's enabled permissions
   */
  private getBasicUserPermissions(userProfile: string): Observable<string[]> {
    console.log('📊 PermissionService - Getting basic permissions for profile:', userProfile);
    
    if (userProfile === 'user') {
      // Return the permissions that are enabled for regular users
      const userPermissions = [
        'view_users',
        'create_user',
        'update_user', 
        'delete_user',
        'reset_user_password',
        'update_user_status',
        'view_allowances', 
        'view_rssb_deductions',
        'view_other_deductions',
        'view_departments',
        'view_payrolls'
      ];
      
      console.log('✅ PermissionService - Returning user permissions:', userPermissions);
      return of(userPermissions);
    }

    // Default basic permissions for other user types
    const basicPermissions = [
      'view_users',
      'view_allowances', 
      'view_rssb_deductions',
      'view_other_deductions',
      'view_departments',
      'view_payrolls'
    ];

    console.log('📝 PermissionService - Returning basic permissions for profile', userProfile, ':', basicPermissions);
    return of(basicPermissions);
  }

  /**
   * Check if a specific permission exists in the system
   */
  permissionExists(permissionName: string): Observable<boolean> {
    return this.getPermissions().pipe(
      map(response => {
        return response.data.some(category => 
          category.permissions.some(permission => permission.name === permissionName)
        );
      }),
      catchError(() => of(false))
    );
  }
} 
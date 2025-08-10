import { Injectable, OnDestroy } from '@angular/core';
import { PermissionService } from './permission.service';
import { LaravelAuthService } from './laravel-auth.service';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PermissionCheckService implements OnDestroy {
  private permissions: string[] = [];
  private userProfile: string | null = null;
  private permissionsLoaded: boolean = false;
  private permissionsLoading: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private permissionService: PermissionService,
    private authService: LaravelAuthService
  ) {
    // Subscribe to auth state changes to clear permissions on logout
    this.authSubscription = this.authService.authState$.subscribe(authState => {
      if (!authState.isAuthenticated) {
        this.clearPermissions();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Load current user's permissions from backend
   */
  loadUserPermissions(): Observable<boolean> {
    if (this.permissionsLoaded || this.permissionsLoading) {
      return of(this.permissionsLoaded);
    }

    this.permissionsLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.permissionsLoading = false;
      return of(false);
    }

    this.userProfile = currentUser.user_profile;

    // Admin bypass - no need to fetch permissions
    if (this.userProfile === 'admin') {
      this.permissions = [];
      this.permissionsLoaded = true;
      this.permissionsLoading = false;
      console.log('🔍 PermissionCheckService - Admin user, bypassing permission checks');
      return of(true);
    }

    // Fetch all permissions and determine which ones are enabled for this user
    return this.permissionService.getCurrentUserPermissions().pipe(
      map(permissions => {
        if (permissions && permissions.length > 0) {
          // Set permissions directly from the service
          this.permissions = permissions;
          this.permissionsLoaded = true;
          console.log('🔍 PermissionCheckService - Loaded user permissions:', this.permissions);
          return true;
        } else {
          console.warn('🔍 PermissionCheckService - No permissions from API, using empty permissions');
          this.setEmptyPermissions();
          return false;
        }
      }),
      catchError(error => {
        console.error('🔍 PermissionCheckService - Failed to load user permissions:', error);
        this.setEmptyPermissions();
        return of(false);
      }),
      tap(() => {
        this.permissionsLoading = false;
      })
    );
  }

  /**
   * Determine which permissions are enabled for the current user
   * This should be replaced with actual backend logic when available
   */
  private determineEnabledPermissions(allPermissions: string[], currentUser: any): string[] {
    // For now, we'll use a simple approach based on user profile
    // This should be replaced with actual group-based permission logic
    
    if (this.userProfile === 'admin') {
      return allPermissions; // Admin gets all permissions
    } else if (this.userProfile === 'user') {
      // For user profile, determine based on what you've actually enabled
      // You can modify this array based on what permissions you've assigned to the user's group
      const enabledPermissions = this.getUserPermissions(currentUser);
      
      // Filter to only include enabled permissions that exist in allPermissions
      return enabledPermissions.filter(permission => allPermissions.includes(permission));
    } else {
      // For other profiles, give basic view permissions
      const basicPermissions = [
        'view_users', 'view_allowances', 'view_rssb_deductions', 
        'view_other_deductions', 'view_departments', 'view_payrolls'
      ];
      
      return basicPermissions.filter(permission => allPermissions.includes(permission));
    }
  }

  /**
   * Get user permissions based on user data or configuration
   * This method can be enhanced to read from user data, localStorage, or other sources
   */
  private getUserPermissions(currentUser: any): string[] {
    // Option 1: Read from user data if available
    if (currentUser.permissions) {
      return currentUser.permissions;
    }

    // Option 2: Read from localStorage if you store permissions there
    const storedPermissions = localStorage.getItem('user_permissions');
    if (storedPermissions) {
      try {
        return JSON.parse(storedPermissions);
      } catch (e) {
        console.warn('Failed to parse stored permissions:', e);
      }
    }

    // Option 3: Read from sessionStorage if you store permissions there
    const sessionPermissions = sessionStorage.getItem('user_permissions');
    if (sessionPermissions) {
      try {
        return JSON.parse(sessionPermissions);
      } catch (e) {
        console.warn('Failed to parse session permissions:', e);
      }
    }

    // Option 4: Default permissions (you can modify this based on your needs)
    // This is where you can set the default permissions for users
   
  }

  /**
   * Set empty permissions when no backend endpoints are available
   */
  private setEmptyPermissions() {
    this.permissions = [];
    this.permissionsLoaded = true;
    console.log('🔍 PermissionCheckService - Using empty permissions (no backend endpoints available)');
  }

  /**
   * Set permissions manually (for testing or fallback)
   */
  setPermissions(permissions: string[], userProfile: string | null) {
    this.permissions = permissions;
    this.userProfile = userProfile;
    this.permissionsLoaded = true;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(code: string): boolean {
    // Admin has all permissions
    if (this.userProfile === 'admin') return true;
    
    // If permissions not loaded yet, return false
    if (!this.permissionsLoaded) return false;
    
    return this.permissions.includes(code);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(codes: string[]): boolean {
    // Admin has all permissions
    if (this.userProfile === 'admin') return true;
    
    // If permissions not loaded yet, return false
    if (!this.permissionsLoaded) return false;
    
    return codes.some(code => this.permissions.includes(code));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(codes: string[]): boolean {
    // Admin has all permissions
    if (this.userProfile === 'admin') return true;
    
    // If permissions not loaded yet, return false
    if (!this.permissionsLoaded) return false;
    
    return codes.every(code => this.permissions.includes(code));
  }

  /**
   * Get all user permissions
   */
  getPermissions(): string[] {
    return this.permissions;
  }

  /**
   * Get user profile
   */
  getUserProfile(): string | null {
    return this.userProfile;
  }

  /**
   * Check if permissions are loaded
   */
  isPermissionsLoaded(): boolean {
    return this.permissionsLoaded;
  }

  /**
   * Check if permissions are currently loading
   */
  isLoading(): boolean {
    return this.permissionsLoading;
  }

  /**
   * Clear permissions (for logout)
   */
  clearPermissions() {
    this.permissions = [];
    this.userProfile = null;
    this.permissionsLoaded = false;
    this.permissionsLoading = false;
  }

  /**
   * Manually clear permissions (can be called from other services)
   */
  forceClearPermissions() {
    this.clearPermissions();
  }
} 
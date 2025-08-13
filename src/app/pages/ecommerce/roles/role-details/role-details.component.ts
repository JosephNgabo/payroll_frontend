import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from 'src/app/core/services/role.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { RoleDetail, RoleDetailResponse, RolePermission } from 'src/app/core/models/role.model';
import { PermissionCategory } from 'src/app/core/models/permission.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.scss']
})

/**
 * Role Details Component
 */
export class RoleDetailsComponent implements OnInit {
  // Component state
  isLoading: boolean = true;
  isLoadingPermissions: boolean = true;
  error: string | null = null;
  permissionsError: string | null = null;
  
  // Role data
  roleDetail: RoleDetail | null = null;
  rolePermissions: RolePermission[] = [];
  permissionCategories: PermissionCategory[] = [];
  
  // UI
  breadCrumbItems: Array<{}>;
  roleId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    this.breadCrumbItems = [
      { label: 'Access Management' }, 
      { label: 'Roles', active: false },
      { label: 'Role Details', active: true }
    ];

    if (!this.roleId) {
      this.toastr.error('Role ID is required', 'Error');
      this.router.navigate(['/users/roles']);
      return;
    }

    this.fetchRoleDetails();
    this.fetchRolePermissions();
    this.fetchPermissionCategories();
  }

  fetchRoleDetails() {
    this.isLoading = true;
    this.error = null;
    
    this.roleService.getRole(this.roleId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response: RoleDetailResponse) => {
        console.log('Role details response:', response);
        this.roleDetail = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch role details. Please try again later.';
        this.isLoading = false;
        this.toastr.error('Failed to fetch role details. Please try again later.', 'Error');
      }
    });
  }

  fetchRolePermissions() {
    this.isLoadingPermissions = true;
    this.permissionsError = null;
    
    this.roleService.getRolePermissions(this.roleId).pipe(
      catchError(this.handleError.bind(this))
    ).subscribe({
      next: (response) => {
        console.log('Role permissions response:', response);
        this.rolePermissions = response.data;
        this.isLoadingPermissions = false;
      },
      error: (err) => {
        this.permissionsError = 'Failed to fetch role permissions. Please try again later.';
        this.isLoadingPermissions = false;
        this.toastr.error('Failed to fetch role permissions. Please try again later.', 'Error');
      }
    });
  }

  fetchPermissionCategories() {
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.permissionCategories = response.data;
      },
      error: (err) => {
        console.error('Failed to fetch permission categories:', err);
      }
    });
  }

  // Get category name by ID
  getCategoryName(categoryId: string): string {
    const category = this.permissionCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  // Get category code by ID
  getCategoryCode(categoryId: string): string {
    const category = this.permissionCategories.find(cat => cat.id === categoryId);
    return category ? category.code : '';
  }

  // Get permissions grouped by category - Updated to use rolePermissions
  getPermissionsByCategory(): { [key: string]: RolePermission[] } {
    const permissions = this.rolePermissions.length > 0 ? this.rolePermissions : (this.roleDetail?.permissions || []);
    
    const grouped: { [key: string]: RolePermission[] } = {};
    
    permissions.forEach(permission => {
      const categoryId = permission.p_category_id;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(permission);
    });

    return grouped;
  }

  // Get total permissions count - Updated to use rolePermissions
  getTotalPermissionsCount(): number {
    return this.rolePermissions.length > 0 ? this.rolePermissions.length : (this.roleDetail?.permissions.length || 0);
  }

  // Navigate back to roles list
  goBack() {
    this.router.navigate(['/access-management/roles']);
  }

  // Edit role
  editRole() {
    this.router.navigate(['/access-management/roles'], { queryParams: { edit: this.roleId } });
  }

  /**
   * Handle HTTP errors and extract backend validation messages
   */
  private handleError(error: any) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error && error.error) {
      if (error.error.errors) {
        // Laravel validation errors
        const errors = error.error.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Service Error:', error);
    this.toastr.error(errorMessage, 'Error');
    
    return throwError(() => errorMessage);
  }
} 
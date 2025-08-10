import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PermissionService } from 'src/app/core/services/permission.service';
import { Permission, PermissionCategory, PermissionsResponse } from 'src/app/core/models/permission.model';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})

/**
 *  permissions component
 */
export class PermissionsComponent implements OnInit {
  // Component state
  isLoading: boolean = true;
  error: string | null = null;
  
  // Alert notification system
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  private alertTimeout: any;
  
  // Permission data
  permissionCategories: PermissionCategory[] = [];
  allPermissions: Permission[] = [];
  
  // UI
  breadCrumbItems: Array<{}>;
  term: any;
  selectedCategory: string = 'all';
  filteredPermissions: Permission[] = [];

  // Modal properties
  selectedCategoryForModal: PermissionCategory | null = null;
  selectedCategoryPermissions: Permission[] = [];
  @ViewChild('categoryModal') categoryModal!: TemplateRef<any>;

  constructor(
    private store: Store,
    private permissionService: PermissionService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Access Management' }, { label: 'Permissions', active: true }];
    this.fetchPermissions();
  }

  fetchPermissions() {
    this.isLoading = true;
    this.error = null;
    this.permissionService.getPermissions().subscribe({
      next: (response: PermissionsResponse) => {
        this.permissionCategories = response.data;
        this.allPermissions = [];
        response.data.forEach(category => {
          this.allPermissions.push(...category.permissions);
        });
        this.filteredPermissions = [...this.allPermissions];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch permissions. Please try again later.';
        this.isLoading = false;
        this.showAlert('Failed to fetch permissions. Please try again later.', 'error');
        console.error(err);
      }
    });
  }

  // Filter permissions by category
  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    if (categoryId === 'all') {
      this.filteredPermissions = [...this.allPermissions];
    } else {
      const category = this.permissionCategories.find(cat => cat.id === categoryId);
      this.filteredPermissions = category ? [...category.permissions] : [];
    }
    this.searchPermission(); // Apply search filter if any
  }

  // Search permissions
  searchPermission() {
    if (this.term) {
      const searchTerm = this.term.toLowerCase();
      let permissionsToSearch = this.selectedCategory === 'all' 
        ? this.allPermissions 
        : this.permissionCategories.find(cat => cat.id === this.selectedCategory)?.permissions || [];
      
      this.filteredPermissions = permissionsToSearch.filter((permission: Permission) => {
        return permission.name.toLowerCase().includes(searchTerm) ||
               permission.label.toLowerCase().includes(searchTerm) ||
               permission.description.toLowerCase().includes(searchTerm) ||
               permission.code.toString().includes(searchTerm);
      });
    } else {
      this.filterByCategory(this.selectedCategory);
    }
  }

  // Get category name by ID
  getCategoryName(categoryId: string): string {
    const category = this.permissionCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  // Get category code by ID
  getCategoryCode(categoryId: string): string {
    const category = this.permissionCategories.find(cat => cat.id === categoryId);
    return category ? category.code : '';
  }

  /**
   * Show alert notification
   */
  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', autoDismiss: boolean = true) {
    this.clearAlert(); // Clear any existing alert
    this.alertMessage = message;
    this.alertType = type;
    
    if (autoDismiss) {
      this.alertTimeout = setTimeout(() => {
        this.clearAlert();
      }, 5000); // Auto dismiss after 5 seconds
    }
  }

  /**
   * Clear alert notification
   */
  clearAlert() {
    this.alertMessage = null;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  /**
   * Open category modal to show permissions
   */
  openCategoryModal(category: PermissionCategory) {
    this.selectedCategoryForModal = category;
    this.selectedCategoryPermissions = category.permissions;
    
    // Open the modal
    this.modalService.open(this.categoryModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true 
    });
  }
} 
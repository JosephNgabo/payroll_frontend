import { Component, OnInit } from '@angular/core';
import { EmployeeProfileService, EmployeeProfileResponse } from 'src/app/core/services/employee-profile.service';

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  joinDate: string;
  manager: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  
  // Employee profile data
  profile: EmployeeProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employeeId: '',
    joinDate: '',
    manager: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  };

  isEditing: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  apiData: EmployeeProfileResponse | null = null;

  constructor(private employeeProfileService: EmployeeProfileService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Profile', active: true }
    ];
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = null;
    
    this.employeeProfileService.getProfile().subscribe({
      next: (response) => {
        this.apiData = response;
        this.mapApiDataToProfile(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.error = 'Failed to load profile data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  mapApiDataToProfile(apiResponse: EmployeeProfileResponse): void {
    const { user, employee } = apiResponse.data;
    
    this.profile = {
      id: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.personal_email,
      phone: employee.personal_mobile,
      position: employee.employee_contracts?.job_title || 'N/A',
      department: employee.employee_contracts?.department || 'N/A',
      employeeId: employee.id,
      joinDate: employee.employee_contracts?.hire_date || 'N/A',
      manager: 'N/A', // Not provided in API
      address: `${employee.document_place_of_issue}, ${employee.nationality?.country || 'N/A'}`,
      emergencyContact: {
        name: employee.employee_emergency_contacts?.[0]?.name || 'N/A',
        relationship: employee.employee_emergency_contacts?.[0]?.relationship || 'N/A',
        phone: employee.employee_emergency_contacts?.[0]?.phone || 'N/A'
      }
    };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    // TODO: Implement save profile logic
    console.log('Saving profile:', this.profile);
    this.isEditing = false;
  }

  cancelEdit(): void {
    // TODO: Reset form data
    this.isEditing = false;
  }

  changePassword(): void {
    // TODO: Open change password modal
    console.log('Change password clicked');
  }
}


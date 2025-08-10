import { Component, OnInit } from '@angular/core';

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
    id: '1',
    firstName: 'Frank',
    lastName: 'Kwizera',
    email: 'frank.kwizera@company.com',
    phone: '+250 788 123 456',
    position: 'Accountant',
    department: 'Finance',
    employeeId: 'EMP001',
    joinDate: '2023-01-15',
    manager: 'John Smith',
    address: 'Kigali, Rwanda',
    emergencyContact: {
      name: 'Jane Kwizera',
      relationship: 'Spouse',
      phone: '+250 788 654 321'
    }
  };

  isEditing: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Profile', active: true }
    ];
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


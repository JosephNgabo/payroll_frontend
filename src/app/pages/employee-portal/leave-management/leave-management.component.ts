import { Component, OnInit } from '@angular/core';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit {

  // Breadcrumb items
  breadCrumbItems: Array<{}>;

  // Leave requests data
  leaveRequests: LeaveRequest[] = [
    {
      id: '1',
      type: 'Annual Leave',
      startDate: '2025-07-11',
      endDate: '2025-07-15',
      days: 5,
      status: 'approved',
      reason: 'Family vacation',
      appliedDate: '2025-06-15'
    },
    {
      id: '2',
      type: 'Sick Leave',
      startDate: '2025-06-20',
      endDate: '2025-06-22',
      days: 3,
      status: 'pending',
      reason: 'Medical appointment',
      appliedDate: '2025-06-18'
    }
  ];

  // Leave balance data
  leaveBalances: LeaveBalance[] = [
    {
      type: 'Annual Leave',
      total: 25,
      used: 7,
      remaining: 18
    },
    {
      type: 'Sick Leave',
      total: 10,
      used: 2,
      remaining: 8
    },
    {
      type: 'Personal Leave',
      total: 5,
      used: 0,
      remaining: 5
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Leave Management', active: true }
    ];
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Request new leave
   */
  requestNewLeave(): void {
    // Navigate to the leave request form
    window.location.href = '/employee-portal/leave-request';
  }

  /**
   * View leave request details
   */
  viewLeaveDetails(leave: LeaveRequest): void {
    // TODO: Open leave details modal
    console.log('Viewing leave details:', leave);
  }

  /**
   * Cancel leave request
   */
  cancelLeaveRequest(leaveId: string): void {
    // TODO: Implement cancel leave request
    console.log('Cancelling leave request:', leaveId);
  }
}

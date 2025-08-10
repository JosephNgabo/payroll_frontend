import { Component, OnInit } from '@angular/core';

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  
  // Sample attendance data
  attendanceRecords: AttendanceRecord[] = [
    { date: '2025-01-08', checkIn: '08:00', checkOut: '17:00', hoursWorked: 8, status: 'present' },
    { date: '2025-01-07', checkIn: '08:15', checkOut: '17:00', hoursWorked: 7.75, status: 'late' },
    { date: '2025-01-06', checkIn: '08:00', checkOut: '17:00', hoursWorked: 8, status: 'present' },
    { date: '2025-01-05', checkIn: '-', checkOut: '-', hoursWorked: 0, status: 'absent' },
    { date: '2025-01-04', checkIn: '08:00', checkOut: '13:00', hoursWorked: 4, status: 'half-day' }
  ];

  // Summary statistics
  totalWorkingDays: number = 20;
  presentDays: number = 18;
  absentDays: number = 1;
  lateDays: number = 2;
  attendanceRate: number = 95;

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Employee Portal' },
      { label: 'Attendance', active: true }
    ];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'present':
        return 'bg-success';
      case 'late':
        return 'bg-warning';
      case 'absent':
        return 'bg-danger';
      case 'half-day':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  checkIn(): void {
    console.log('Checking in...');
  }

  checkOut(): void {
    console.log('Checking out...');
  }
}


# Dashboard Widgets API Documentation

## Overview

The Dashboard Widgets API provides a permission-based system for retrieving dashboard data. Each widget checks user permissions before returning data, ensuring users only see information they're authorized to access.

## Base URL
```
/api/dashboard
```

## Authentication
All endpoints require authentication via Sanctum token.

## Endpoints

### 1. Get All Available Widgets
**GET** `/available-widgets`

Returns a list of all widgets and whether the current user has access to them.

**Response:**
```json
{
    "status": "success",
    "message": "Available widgets retrieved successfully",
    "data": {
        "team_leave_today": true,
        "pending_approvals": true,
        "attendance_alerts": false,
        "payrolls_waiting_approval": true,
        "team_performance": true,
        "pending_leave_requests": true,
        "active_vs_inactive_employees": false,
        "payroll_status": true,
        "compliance_alerts": false,
        "hr_requests": true,
        "quick_stats": true,
        "system_health": false,
        "user_logins_summary": false,
        "license_module_status": false,
        "audit_logs": false,
        "backup_restore_alerts": false,
        "notification_setup": false
    }
}
```

### 2. Get Dashboard Data (All Widgets)
**GET** `/`

Returns data for all widgets the user has access to.

**Query Parameters:**
- `widgets` (optional): Comma-separated list of specific widgets to retrieve

**Examples:**
```
GET /api/dashboard
GET /api/dashboard?widgets=team_leave_today,pending_approvals
```

**Response:**
```json
{
    "status": "success",
    "message": "Dashboard data retrieved successfully",
    "data": {
        "team_leave_today": {
            "total_absent": 3,
            "employees": [
                {
                    "employee_name": "John Doe",
                    "leave_type": "Annual Leave",
                    "start_date": "2024-01-15",
                    "end_date": "2024-01-17",
                    "days": 3
                }
            ]
        },
        "pending_approvals": {
            "leave_approvals": 5,
            "payroll_approvals": 2,
            "timesheet_approvals": 0,
            "overtime_approvals": 0
        }
    }
}
```

### 3. Get Specific Widget Data
**GET** `/widget/{widgetName}`

Returns data for a specific widget.

**Path Parameters:**
- `widgetName`: Name of the widget to retrieve

**Examples:**
```
GET /api/dashboard/widget/team_leave_today
GET /api/dashboard/widget/pending_approvals
```

**Response:**
```json
{
    "status": "success",
    "message": "Widget data retrieved successfully",
    "data": {
        "total_absent": 3,
        "employees": [
            {
                "employee_name": "John Doe",
                "leave_type": "Annual Leave",
                "start_date": "2024-01-15",
                "end_date": "2024-01-17",
                "days": 3
            }
        ]
    }
}
```

## Available Widgets

### 1. Team Leave Today
**Widget Name:** `team_leave_today`

**Description:** Shows employees who are absent today due to approved leave.

**Permissions Required:**
- Admin access, OR
- Department manager of the employee's department, OR
- Permission ID: 1001

**Data Structure:**
```json
{
    "total_absent": 3,
    "employees": [
        {
            "employee_name": "John Doe",
            "leave_type": "Annual Leave",
            "start_date": "2024-01-15",
            "end_date": "2024-01-17",
            "days": 3
        }
    ]
}
```

### 2. Pending Approvals
**Widget Name:** `pending_approvals`

**Description:** Shows count of pending approvals for leave, payroll, timesheets, and overtime.

**Permissions Required:**
- Admin access, OR
- Department manager, OR
- Permission ID: 1002

**Data Structure:**
```json
{
    "leave_approvals": 5,
    "payroll_approvals": 2,
    "timesheet_approvals": 0,
    "overtime_approvals": 0
}
```

### 3. Attendance Alerts
**Widget Name:** `attendance_alerts`

**Description:** Shows attendance-related alerts like late arrivals and absenteeism.

**Permissions Required:**
- Admin access, OR
- Department manager, OR
- Permission ID: 1003

**Data Structure:**
```json
{
    "late_arrivals": 5,
    "absenteeism": 2,
    "early_departures": 1,
    "total_alerts": 8
}
```

### 4. Payrolls Waiting for Manager Approval
**Widget Name:** `payrolls_waiting_approval`

**Description:** Shows payrolls that are waiting for manager approval.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1004

**Data Structure:**
```json
{
    "pending_count": 3,
    "payrolls": [
        {
            "id": "uuid",
            "month": 1,
            "year": 2024,
            "total_employees": 25,
            "total_amount": 125000
        }
    ]
}
```

### 5. Team Performance Overview
**Widget Name:** `team_performance`

**Description:** Shows team performance metrics including goals and reviews.

**Permissions Required:**
- Admin access, OR
- Department manager, OR
- Permission ID: 1005

**Data Structure:**
```json
{
    "goals_completed": 75,
    "reviews_pending": 12,
    "performance_score": 8.5,
    "team_size": 25
}
```

### 6. Pending Leave Requests
**Widget Name:** `pending_leave_requests`

**Description:** Shows pending leave requests that need approval.

**Permissions Required:**
- Admin access, OR
- Department manager, OR
- Time off officer permissions

**Data Structure:**
```json
{
    "total_pending": 8,
    "requests": [
        {
            "id": "uuid",
            "employee_name": "Jane Smith",
            "leave_type": "Sick Leave",
            "start_date": "2024-01-20",
            "end_date": "2024-01-22",
            "days": 3,
            "submitted_at": "2024-01-18T10:30:00Z"
        }
    ]
}
```

### 7. Active vs Inactive Employees
**Widget Name:** `active_vs_inactive_employees`

**Description:** Shows statistics about active and inactive employees.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1006

**Data Structure:**
```json
{
    "active": 150,
    "inactive": 5,
    "total": 155,
    "active_percentage": 96.77
}
```

### 8. Payroll Status
**Widget Name:** `payroll_status`

**Description:** Shows payroll processing status.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1007

**Data Structure:**
```json
{
    "processing": 2,
    "validated": 5,
    "locked": 3,
    "total": 10
}
```

### 9. Compliance Alerts
**Widget Name:** `compliance_alerts`

**Description:** Shows compliance-related alerts like RSSB and RRA deadlines.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1008

**Data Structure:**
```json
{
    "rssb_deadlines": 3,
    "rra_deadlines": 1,
    "expiring_contracts": 5,
    "total_alerts": 9
}
```

### 10. HR Requests
**Widget Name:** `hr_requests`

**Description:** Shows HR-related requests like letters, certificates, and advances.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1009

**Data Structure:**
```json
{
    "letters": 8,
    "certificates": 12,
    "advances": 3,
    "total_requests": 23
}
```

### 11. Quick Stats
**Widget Name:** `quick_stats`

**Description:** Shows quick statistics like new hires, exits, and expiring contracts.

**Permissions Required:**
- Admin access, OR
- Permission ID: 1010

**Data Structure:**
```json
{
    "new_hires_this_month": 3,
    "exits_this_month": 2,
    "expiring_contracts": 5,
    "total_employees": 155
}
```

### 12. System Health
**Widget Name:** `system_health`

**Description:** Shows system health metrics like server usage and uptime.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "server_usage": 65,
    "uptime": 99.9,
    "errors_today": 2,
    "status": "healthy"
}
```

### 13. User Logins Summary
**Widget Name:** `user_logins_summary`

**Description:** Shows user login statistics.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "active_users_today": 45,
    "failed_logins": 3,
    "total_logins": 156,
    "unique_users": 42
}
```

### 14. License & Module Status
**Widget Name:** `license_module_status`

**Description:** Shows license and module status information.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "license_status": "active",
    "expiry_date": "2024-12-31",
    "modules": {
        "payroll": "active",
        "leave_management": "active",
        "attendance": "active",
        "hr_management": "active"
    }
}
```

### 15. Audit Logs
**Widget Name:** `audit_logs`

**Description:** Shows recent audit log entries.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "recent_actions": [
        {
            "action": "User login",
            "user": "john.doe",
            "timestamp": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### 16. Backup/Restore Alerts
**Widget Name:** `backup_restore_alerts`

**Description:** Shows backup and restore system alerts.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "last_backup": "2024-01-15T04:00:00Z",
    "backup_status": "successful",
    "storage_usage": 75,
    "alerts": []
}
```

### 17. Notification Setup & Issues
**Widget Name:** `notification_setup`

**Description:** Shows notification system status and issues.

**Permissions Required:**
- Admin access only

**Data Structure:**
```json
{
    "email_notifications": "enabled",
    "sms_notifications": "disabled",
    "push_notifications": "enabled",
    "issues": []
}
```

## Error Responses

### 401 Unauthorized
```json
{
    "status": "error",
    "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
    "status": "error",
    "message": "Access denied to this widget"
}
```

### 404 Not Found
```json
{
    "status": "error",
    "message": "Widget not found"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Get all available widgets
const response = await fetch('/api/dashboard/available-widgets', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Get specific widget data
const widgetData = await fetch('/18|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af818|CJrLalBBm3XZbUqRbEPDoTxsuFWIkQLdoIpkWFwD1fbb0af8', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Get all dashboard data
const dashboardData = await fetch('/api/dashboard', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const DashboardWidget = ({ widgetName }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWidgetData = async () => {
            try {
                const response = await fetch(`/api/dashboard/widget/${widgetName}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch widget data');
                }

                const result = await response.json();
                setData(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWidgetData();
    }, [widgetName]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div className="widget">
            {/* Render widget based on widgetName and data */}
        </div>
    );
};
```

## Permission System

The dashboard widgets use a comprehensive permission system:

1. **Admin Access**: Users with `user_profile === 'admin'` have access to all widgets
2. **Department Manager**: Users who are department managers can access team-related widgets
3. **Specific Permissions**: Each widget can require specific permission IDs
4. **Time Off Officer**: Special permissions for leave-related widgets

## Best Practices

1. **Caching**: Consider caching widget data on the frontend to reduce API calls
2. **Error Handling**: Always handle permission errors gracefully
3. **Loading States**: Show loading indicators while fetching widget data
4. **Responsive Design**: Ensure widgets work well on different screen sizes
5. **Real-time Updates**: Consider WebSocket connections for real-time dashboard updates

## Migration from Legacy Endpoints

The new widget system maintains backward compatibility with existing endpoints:

- `/api/dashboard/` → `/api/dashboard/` (now returns all widgets)
- `/api/dashboard/widgets` → `/api/dashboard/available-widgets`
- `/api/dashboard/cards/*` → `/api/dashboard/widget/*`
- `/api/dashboard/reports/*` → `/api/dashboard/widget/*`

All legacy endpoints now redirect to the new widget system while maintaining the same response structure.

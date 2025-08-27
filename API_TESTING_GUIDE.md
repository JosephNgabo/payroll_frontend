# API Testing Guide

## Quick Start

### 1. Authentication
```bash
# Login to get token
curl -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### 2. Set Token
```bash
export TOKEN="your_token_here"
```

## Leave APIs Testing

### Create Leave Request
```bash
curl -X POST http://localhost:8000/api/employee-time-off-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 1,
    "time_off_type_id": 1,
    "start_date": "2024-01-20",
    "end_date": "2024-01-22",
    "requested_days": 3,
    "reason": "Annual vacation"
  }'
```

### Get All Leave Requests
```bash
curl -X GET http://localhost:8000/api/employee-time-off-requests \
  -H "Authorization: Bearer $TOKEN"
```

### Approve Leave Request
```bash
curl -X POST http://localhost:8000/api/employee-time-off-requests/1/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approver_id": 1}'
```

### Reject Leave Request
```bash
curl -X POST http://localhost:8000/api/employee-time-off-requests/1/reject \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Insufficient notice", "approver_id": 1}'
```

## Dashboard APIs Testing

### Get Available Widgets
```bash
curl -X GET http://localhost:8000/api/dashboard/available-widgets \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Dashboard Data
```bash
curl -X GET http://localhost:8000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Widget
```bash
curl -X GET http://localhost:8000/api/dashboard/widget/team_leave_today \
  -H "Authorization: Bearer $TOKEN"
```

### Get Multiple Widgets
```bash
curl -X GET "http://localhost:8000/api/dashboard?widgets=team_leave_today,pending_approvals" \
  -H "Authorization: Bearer $TOKEN"
```

## Payroll APIs Testing

### Get Pending Payrolls
```bash
curl -X GET "http://localhost:8000/api/payrolls?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Approve Payroll
```bash
curl -X PUT http://localhost:8000/api/payrolls/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

## Test Scenarios

### Admin User
```bash
# Login as admin
curl -X POST http://localhost:8000/api/user/login \
  -d '{"email": "admin@example.com", "password": "password"}'

# Should see all widgets
curl -X GET http://localhost:8000/api/dashboard/available-widgets \
  -H "Authorization: Bearer $TOKEN"
```

### Department Manager
```bash
# Login as manager
curl -X POST http://localhost:8000/api/user/login \
  -d '{"email": "manager@example.com", "password": "password"}'

# Should only see team-related widgets
curl -X GET http://localhost:8000/api/dashboard/available-widgets \
  -H "Authorization: Bearer $TOKEN"
```

### Time Off Officer
```bash
# Login as time off officer
curl -X POST http://localhost:8000/api/user/login \
  -d '{"email": "timeoff@example.com", "password": "password"}'

# Should see leave-related widgets
curl -X GET http://localhost:8000/api/dashboard/available-widgets \
  -H "Authorization: Bearer $TOKEN"
```

## Expected Responses

### Successful Leave Request Creation
```json
{
  "status": "success",
  "message": "Leave request created successfully",
  "data": {
    "id": "uuid",
    "approval_status": "pending"
  }
}
```

### Available Widgets Response
```json
{
  "status": "success",
  "data": {
    "team_leave_today": true,
    "pending_approvals": true,
    "system_health": false
  }
}
```

### Dashboard Widget Response
```json
{
  "status": "success",
  "data": {
    "total_absent": 2,
    "employees": [
      {
        "employee_name": "John Doe",
        "leave_type": "Annual Leave"
      }
    ]
  }
}
```

## Error Testing

### Unauthorized Access
```bash
curl -X GET http://localhost:8000/api/dashboard/widget/system_health \
  -H "Authorization: Bearer $TOKEN"
# Should return 403 Forbidden
```

### Invalid Widget
```bash
curl -X GET http://localhost:8000/api/dashboard/widget/invalid_widget \
  -H "Authorization: Bearer $TOKEN"
# Should return 404 Not Found
```

## Postman Collection

Import this into Postman:

```json
{
  "info": {"name": "Payroll API Testing"},
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"admin@example.com\", \"password\": \"password\"}"
        }
      }
    },
    {
      "name": "Get Dashboard",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/dashboard",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Create Leave Request",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/employee-time-off-requests",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "body": {
          "mode": "raw",
          "raw": "{\"employee_id\": 1, \"time_off_type_id\": 1, \"start_date\": \"2024-01-20\", \"end_date\": \"2024-01-22\", \"requested_days\": 3, \"reason\": \"Test\"}"
        }
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:8000"},
    {"key": "token", "value": ""}
  ]
}
```

## Quick Test Checklist

- [ ] Login and get token
- [ ] Test dashboard widgets access
- [ ] Create leave request
- [ ] Approve/reject leave request
- [ ] Test different user roles
- [ ] Verify permission restrictions
- [ ] Test error responses

## Common Issues

1. **401 Unauthorized**: Check if token is valid and included in headers
2. **403 Forbidden**: User doesn't have permission for that widget/action
3. **404 Not Found**: Widget name or endpoint doesn't exist
4. **422 Validation Error**: Check request body format and required fields

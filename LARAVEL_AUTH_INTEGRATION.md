# Laravel Authentication Integration

## Overview
This document outlines the complete Laravel backend authentication integration for the Angular payroll frontend application.

## 🔧 Configuration Changes

### Environment Configuration
- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

Updated to use Laravel backend:
```typescript
export const environment = {
  production: false,
  defaultauth: 'laravel', // Changed from 'fakebackend'
  apiUrl: 'http://38.242.240.201:8000/api', // Your Laravel backend URL
  // ... other config
};
```

## 📁 New Files Created

### 1. Authentication Models
**File**: `src/app/core/models/auth.models.ts`
- `LoginRequest` - Interface for login credentials
- `LoginResponse` - Interface for Laravel API response
- `User` - User data interface
- `AuthState` - Authentication state management
- `ApiResponse<T>` - Generic API response wrapper

### 2. Laravel Authentication Service
**File**: `src/app/core/services/laravel-auth.service.ts`

**Key Features**:
- ✅ **Secure Token Storage**: Uses sessionStorage for token management
- ✅ **State Management**: Reactive authentication state with BehaviorSubject
- ✅ **Error Handling**: Comprehensive error handling for all HTTP requests
- ✅ **Session Persistence**: Maintains user session across browser refreshes

**Main Methods**:
- `login(credentials)` - Authenticate user with Laravel backend
- `logout()` - Logout user and clear session
- `getCurrentUserInfo()` - Fetch current user profile
- `isAuthenticated()` - Check if user is authenticated
- `getAuthHeaders()` - Get headers for authenticated requests

### 3. HTTP Interceptor
**File**: `src/app/core/interceptors/auth.interceptor.ts`

**Features**:
- ✅ **Automatic Token Injection**: Adds Bearer token to all API requests
- ✅ **Public Endpoint Handling**: Skips authentication for login/register endpoints
- ✅ **Error Handling**: Handles 401 errors and redirects to login

### 4. Authentication Guard
**File**: `src/app/core/guards/laravel-auth.guard.ts`

**Purpose**: Protects routes from unauthorized access
- Redirects unauthenticated users to login page
- Can be applied to any route that requires authentication

## 🔄 Updated Components

### 1. Login Component
**File**: `src/app/account/auth/login/login.component.ts`

**Changes**:
- ✅ **Username Field**: Changed from email to username (matches Laravel backend)
- ✅ **Form Validation**: Enhanced validation with proper error messages
- ✅ **Loading States**: Shows loading spinner during authentication
- ✅ **Error Handling**: Displays user-friendly error messages
- ✅ **Reactive State**: Subscribes to authentication state changes
- ✅ **Auto-redirect**: Automatically redirects on successful login

**Updated Template**: `src/app/account/auth/login/login.component.html`
- Added error alert display
- Enhanced form validation feedback
- Loading states for submit button
- Improved user experience

### 2. Topbar Component
**File**: `src/app/layouts/topbar/topbar.component.ts`

**Changes**:
- ✅ **Laravel Logout**: Integrated with Laravel authentication service
- ✅ **Conditional Logic**: Handles different authentication types
- ✅ **Error Handling**: Graceful logout even if API fails

## 🚀 Application Bootstrap

### Main.ts Configuration
**File**: `src/main.ts`

**Changes**:
- ✅ **Conditional Interceptors**: Uses appropriate interceptor based on auth type
- ✅ **Laravel Support**: Includes Laravel auth interceptor when configured
- ✅ **Backward Compatibility**: Maintains support for Firebase and fake backend

## 🔐 Security Features

### 1. Token Management
- **Secure Storage**: Uses sessionStorage (cleared on browser close)
- ✅ **Automatic Cleanup**: Clears session data on logout or 401 errors

### 2. Session Security
- ✅ **Secure Headers**: Proper Authorization headers for all requests
- ✅ **Session Cleanup**: Complete cleanup on logout

### 3. Error Handling
- ✅ **User-Friendly Messages**: Clear error messages for users
- ✅ **Graceful Degradation**: App continues to work even if logout API fails
- ✅ **Automatic Redirects**: Redirects to login on authentication failures

## 📡 API Integration

### Laravel Endpoints Used
1. **POST** `/api/user/login` - User authentication
2. **POST** `/api/user/logout` - User logout
3. **GET** `/api/user/profile` - Get user profile

### Request/Response Format
```typescript
// Login Request
{
  "username": "admin",
  "password": "admin123"
}

// Login Response
{
  "status": true,
  "message": "Success",
  "data": {
    "id": "0197842d-a7c2-730c-b2ce-c186b1eb02ad",
    "username": "admin",
    "email": "admin@gmail.com",
    "title": "admin",
    "user_profile": "admin",
    "language": "en",
    "is_active": 1,
    "token": "6|4baqa6sNLDTgoVCystsNmfWS6KHEHEdCTb2cjmo73241467e"
  }
}
```

## 🧪 Testing

### Test Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Endpoint**: `http://38.242.240.201:8000/api/user/login`

### Manual Testing Steps
1. Navigate to login page
2. Enter credentials: `admin` / `admin123`
3. Click "Log In"
4. Verify successful redirect to dashboard
5. Check sessionStorage for stored token and user data
6. Test logout functionality
7. Verify session cleanup

## 🔧 Usage Examples

### Protecting Routes
```typescript
// In routing module
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [LaravelAuthGuard]
}
```

### Using Auth Service in Components
```typescript
constructor(private authService: LaravelAuthService) {}

// Check if authenticated
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = this.authService.getCurrentUser();

// Subscribe to auth state changes
this.authService.authState$.subscribe(state => {
});
```

### Making Authenticated API Calls
```typescript
// The interceptor automatically adds auth headers
this.http.get('/api/protected-endpoint').subscribe(response => {
  // Request will include Authorization: Bearer <token>
});
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure Laravel backend allows requests from Angular domain
2. **Session Loss**: Verify sessionStorage is not being cleared unexpectedly
3. **API Errors**: Check browser network tab for detailed error responses

### Debug Mode
Enable console logging in the auth service for debugging:
```typescript
```

## 📋 Next Steps

1. **Route Protection**: Apply `LaravelAuthGuard` to protected routes
2. **User Profile**: Implement user profile management
3. **Password Reset**: Add password reset functionality
4. **Registration**: Implement user registration if needed
5. **Role-Based Access**: Add role-based route protection
6. **Remember Me**: Implement "Remember Me" functionality

## 🔄 Migration from Fake Backend

To switch from fake backend to Laravel:
1. Update environment files with Laravel API URL
2. Change `defaultauth` to `'laravel'`
3. Restart the application
4. Test login with real credentials

The integration is designed to be backward compatible, so you can easily switch between authentication types by changing the environment configuration.

## ✅ Verified Working

The authentication integration has been tested and verified to work with your Laravel backend:
- ✅ Login functionality working
- ✅ Token storage in sessionStorage
- ✅ User data properly extracted and stored
- ✅ Response structure matches Laravel API format 
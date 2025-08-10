import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User, AuthState } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class LaravelAuthService {
  private readonly API_URL = `${environment.apiUrl}`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // BehaviorSubject to track authentication state
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize auth state from session storage on service creation
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from session storage
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }

  /**
   * Login user with Laravel backend
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Set loading state
    this.updateAuthState({ isLoading: true, error: null });

    const loginUrl = `${this.API_URL}/user/login`;
    console.log('LaravelAuthService - Login URL:', loginUrl);
    console.log('LaravelAuthService - Login credentials:', credentials);
    console.log('LaravelAuthService - API_URL from environment:', this.API_URL);

    // Set proper headers for the request
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(loginUrl, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('LaravelAuthService - Login response:', response);
          if (response.status) {
            this.handleSuccessfulLogin(response);
          } else {
            this.updateAuthState({ 
              isLoading: false, 
              error: response.message || 'Login failed' 
            });
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Handle successful login
   */
  private handleSuccessfulLogin(response: LoginResponse): void {
    const { data } = response;
    
    console.log('LaravelAuthService - Handling successful login with data:', data);
    
    // Create user object from response data
    const user: User = {
      id: data.id,
      username: data.username,
      email: data.email,
      title: data.title,
      user_profile: data.user_profile,
      language: data.language,
      is_active: data.is_active,
      permissions: data.permissions
    };
    
    console.log('LaravelAuthService - Created user object:', user);
    
    // Store token and user data securely
    this.storeToken(data.token);
    this.storeUser(user);
    
    console.log('LaravelAuthService - Stored token and user data');
    
    // Update auth state
    const newAuthState = {
      user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    };
    
    console.log('LaravelAuthService - Updating auth state to:', newAuthState);
    this.updateAuthState(newAuthState);
    
    console.log('LaravelAuthService - Auth state updated successfully');
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    const token = this.getToken();
    
    if (token) {
      // Call logout endpoint to invalidate token on server
      const headers = this.getAuthHeaders();
      return this.http.post(`${this.API_URL}/user/logout`, {}, { headers })
        .pipe(
          tap(() => this.clearAuthData()),
          catchError(() => {
            // Even if logout API fails, clear local data
            this.clearAuthData();
            return throwError(() => new Error('Logout failed'));
          })
        );
    } else {
      this.clearAuthData();
      return new Observable(observer => {
        observer.next({});
        observer.complete();
      });
    }
  }

  /**
   * Get current user information
   */
  getCurrentUserInfo(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ status: boolean; data: User }>(`${this.API_URL}/user/profile`, { headers })
      .pipe(
        map(response => response.data),
        tap(user => {
          // Update stored user data
          this.storeUser(user);
          this.updateAuthState({ user });
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Get current user from session storage
   */
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Store token securely in session storage
   */
  private storeToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Store user data in session storage
   */
  private storeUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
    this.updateAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Update authentication state
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    const newState = { ...currentState, ...updates };
    
    console.log('LaravelAuthService - Updating auth state:', {
      current: currentState,
      updates: updates,
      new: newState
    });
    
    this.authStateSubject.next(newState);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    // Attempt to extract a message, falling back to a generic error.
    if (error && error.error && error.error.message) {
      // Handles standard HttpErrorResponse with a JSON body like { message: '...' }
      errorMessage = error.error.message;
    } else if (error && error.message) {
      // Handles standard JS Error objects or objects with a 'message' property
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // Handles plain string errors
      errorMessage = error;
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password.';
    }
    
    // For debugging in development
    console.error('Authentication Error:', error);

    this.updateAuthState({
      isLoading: false,
      error: errorMessage,
    });
    
    return throwError(() => new Error(errorMessage));
  }
} 
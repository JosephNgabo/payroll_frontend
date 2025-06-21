import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LaravelAuthService } from '../services/laravel-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: LaravelAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Debug logging - only for non-GET requests to reduce noise
    if (request.method !== 'GET') {
      console.log('AuthInterceptor - Request:', request.method, request.url);
    }
    
    // Skip authentication for login and public endpoints
    if (this.isPublicEndpoint(request.url)) {
      return next.handle(request).pipe(
        catchError(error => {
          console.error('AuthInterceptor - Public endpoint error:', error);
          return throwError(() => error);
        })
      );
    }

    // Add auth token to request
    const authReq = this.addToken(request);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only log non-validation errors to avoid cluttering console with expected validation messages
        if (error.status !== 422) {
          const status = error.status || 'Unknown';
          const message = error.error?.message || error.message || error.statusText || 'Unknown error';
          console.error('AuthInterceptor - Request error:', status, message);
        } else {
          console.log('AuthInterceptor - Validation error (422) - handled by component');
        }
        
        if (error.status === 401) {
          // Clear auth data and redirect to login on 401 errors
          this.authService.logout().subscribe();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add authentication token to request headers
   */
  private addToken(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return request;
  }

  /**
   * Check if endpoint is public (doesn't require authentication)
   */
  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/user/login',
      '/user/register',
      '/user/forgot-password',
      '/user/reset-password'
    ];
    
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }
} 
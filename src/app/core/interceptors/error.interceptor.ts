import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, request);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle HTTP errors with detailed logging and user feedback
   */
  private handleError(error: HttpErrorResponse, request: HttpRequest<any>) {
    const url = request.url;
    const method = request.method;
    const status = error.status;
    const statusText = error.statusText;
    
    // Extract error details
    const errorResponse = error.error;
    const message = errorResponse?.message || error.message || statusText || 'Unknown error';
    const errors = errorResponse?.errors || {};
    const exception = errorResponse?.exception;
    const file = errorResponse?.file;
    const line = errorResponse?.line;
    const trace = errorResponse?.trace;
    
    // Create detailed error log
    const errorLog = {
      timestamp: new Date().toISOString(),
      url,
      method,
      status,
      statusText,
      message,
      errors,
      exception,
      file,
      line,
      requestBody: request.body,
      requestHeaders: request.headers,
      responseHeaders: error.headers
    };
    
    // Log error based on status code
    switch (status) {
      case 400:
        console.error('🚫 Bad Request Error:', errorLog);
        this.toastr.error(`Bad Request: ${message}`, 'Error');
        break;
        
      case 401:
        console.error('🔐 Unauthorized Error:', errorLog);
        this.toastr.error('Authentication required. Please login again.', 'Unauthorized');
        break;
        
      case 403:
        console.error('🚫 Forbidden Error:', errorLog);
        this.toastr.error('You do not have permission to perform this action.', 'Forbidden');
        break;
        
      case 404:
        console.error('🔍 Not Found Error:', errorLog);
        this.toastr.error('The requested resource was not found.', 'Not Found');
        break;
        
      case 409:
        console.error('⚠️ Conflict Error:', errorLog);
        this.toastr.error(`Conflict: ${message}`, 'Conflict');
        break;
        
      case 422:
        console.warn('📝 Validation Error:', errorLog);
        // Don't show toast for validation errors as they're handled by components
        break;
        
      case 429:
        console.error('⏰ Too Many Requests Error:', errorLog);
        this.toastr.error('Too many requests. Please try again later.', 'Rate Limited');
        break;
        
      case 500:
        console.error('💥 Server Error:', errorLog);
        this.toastr.error('Internal server error. Please try again later.', 'Server Error');
        break;
        
      case 502:
        console.error('🌐 Bad Gateway Error:', errorLog);
        this.toastr.error('Service temporarily unavailable. Please try again later.', 'Service Unavailable');
        break;
        
      case 503:
        console.error('🔧 Service Unavailable Error:', errorLog);
        this.toastr.error('Service temporarily unavailable. Please try again later.', 'Service Unavailable');
        break;
        
      default:
        console.error('❓ Unknown Error:', errorLog);
        this.toastr.error(`Unexpected error: ${message}`, 'Error');
        break;
    }
    
    // Log validation errors in detail
    if (status === 422 && Object.keys(errors).length > 0) {
      console.group('📋 Validation Errors:');
      Object.keys(errors).forEach(field => {
        console.error(`${field}:`, errors[field]);
      });
      console.groupEnd();
    }
    
    // Log exception details if available
    if (exception) {
      console.group('🐛 Exception Details:');
      console.error('Exception:', exception);
      if (file) console.error('File:', file);
      if (line) console.error('Line:', line);
      if (trace) console.error('Trace:', trace);
      console.groupEnd();
    }
  }
} 
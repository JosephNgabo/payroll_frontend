import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(err => {
                let errorMsg = 'An unexpected error occurred.';

                // Handle Laravel validation errors (422)
                if (err.status === 422 && err.error?.errors) {
                    const messages = Object.values(err.error.errors).flat().join('<br>');
                    Swal.fire({ html: messages, icon: 'error' });
                    console.error('Validation Error:', err);
                    return throwError(messages);
                }

                // Prefer backend error message if available
                if (err?.error?.message) {
                    errorMsg = err.error.message;
                } else if (typeof err.error === 'string') {
                    errorMsg = err.error;
                } else if (err.statusText) {
                    errorMsg = err.statusText;
                }

                // Show error using SweetAlert
                Swal.fire({ html: errorMsg, icon: 'error' });

                // Optionally, handle 401 (unauthorized) as before
            if (err.status === 401) {
                setTimeout(() => {
                        window.sessionStorage.clear();
                    window.location.href = "/";
                }, 3000);
            }

                // Log the full error for debugging
                console.error('API Error:', err);
                return throwError(errorMsg);
            })
        );
    }
}

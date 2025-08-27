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
        return next.handle(request).pipe(catchError(err => {
            let error;
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                Swal.fire({ html: err?.error?.message, icon: 'error' });
                setTimeout(() => {
                    window.sessionStorage.clear()
                    window.location.href = "/";
                }, 3000);
            }
            else if (err?.error?.message || err?.error?.errors) {
                error = err.error.message || err.error.errors;
            }
            else {
                error = err.error || err.statusText || err.message;
            }
            return throwError(() => error);
        }));
    }
}

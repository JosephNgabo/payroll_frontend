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
            if (err?.error?.hint) {
                error = `<section class="errorStyle">
                 <h2>Code:&nbsp;${err?.error?.errorCode}</h2>
                 <small>${err?.error?.message || err.statusText}</small>
                 ${err.error?.hint ? `<small class="hint">Hint:&nbsp;${err?.error?.hint}</small>` : ''}
               </section>`;
            }
            else {
                error = err.error || err.statusText;
            }
            return throwError(error);
        }));
    }
}

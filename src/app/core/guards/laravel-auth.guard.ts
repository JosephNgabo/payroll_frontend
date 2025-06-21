import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LaravelAuthService } from '../services/laravel-auth.service';

@Injectable({ providedIn: 'root' })
export class LaravelAuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: LaravelAuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // Check if user is authenticated using our Laravel auth service
        if (this.authService.isAuthenticated()) {
            // User is authenticated, allow access
            return true;
        }

        // User is not authenticated, redirect to login page with return URL
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
} 
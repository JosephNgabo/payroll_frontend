import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Subscription } from 'rxjs';
import { LaravelAuthService } from 'src/app/core/services/laravel-auth.service';
import { AuthState } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SlickCarouselModule]
})

/**
 * Login component
 */
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: UntypedFormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  returnUrl: string = '/';

  // set the current year
  year: number = new Date().getFullYear();

  // slideConfig for ngx-slick-carousel
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  private authSubscription: Subscription | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: LaravelAuthService
  ) {
    // Initialize form with validation in constructor
    this.loginForm = this.formBuilder.group({
      username: ['admin', [Validators.required, Validators.minLength(3)]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('LoginComponent - Return URL:', this.returnUrl);

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('LoginComponent - User already authenticated, redirecting to:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Subscribe to auth state changes
    this.authSubscription = this.authService.authState$.subscribe(
      (authState: AuthState) => {
        console.log('LoginComponent - Auth state changed:', authState);
        this.isLoading = authState.isLoading;
        this.error = authState.error;
        
        if (authState.isAuthenticated && authState.user) {
          console.log('LoginComponent - User authenticated, redirecting to:', this.returnUrl);
          // Redirect to dashboard on successful login
          this.router.navigate([this.returnUrl]);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm?.controls || {}; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.error = null;

    // Stop here if form is invalid
    if (this.loginForm?.invalid) {
      return;
    }

    const credentials = {
      username: this.f['username']?.value,
      password: this.f['password']?.value
    };

    console.log('LoginComponent - Submitting login with credentials:', credentials);

    // Call authentication service
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('LoginComponent - Login successful:', response);
        // Navigation will be handled by the auth state subscription
      },
      error: (error) => {
        console.error('LoginComponent - Login failed:', error);
        // Error handling is done in the auth service and reflected in auth state
      }
    });
  }

  /**
   * Clear error message
   */
  clearError() {
    this.error = null;
  }

  /**
   * Get error message for form field
   */
  getFieldError(fieldName: string): string {
    const field = this.f[fieldName];
    if (field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}

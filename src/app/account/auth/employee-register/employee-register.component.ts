import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { EmployeeRegistrationService } from 'src/app/core/services/employee-registration.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-register',
  templateUrl: './employee-register.component.html',
  styleUrls: ['./employee-register.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SlickCarouselModule]
})

/**
 * Employee Registration component
 */
export class EmployeeRegisterComponent implements OnInit {
  registerForm: UntypedFormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;

  // slideConfig for ngx-slick-carousel
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private employeeRegistrationService: EmployeeRegistrationService
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Component initialization
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm?.controls || {}; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.error = null;
    this.success = null;

    // Stop here if form is invalid
    if (this.registerForm?.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.f['email']?.value;

    console.log('EmployeeRegisterComponent - Submitting email:', email);

    // Call the employee registration service
    this.employeeRegistrationService.registerEmployee(email).subscribe({
      next: (response: any) => {
        console.log('EmployeeRegisterComponent - Registration successful:', response);
        this.isLoading = false;
        
        // Show success message
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registration Successful!',
          text: 'If your email is found in our system, login credentials have been sent to your email address.',
          showConfirmButton: true,
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#34c38f'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (error) => {
        console.error('EmployeeRegisterComponent - Registration failed:', error);
        this.isLoading = false;
        
        if (error.error?.message === 'No employee found with this email address') {
          // Show SweetAlert for "No employee found" error
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'Employee Not Found',
            text: 'No employee found with this email address. Please contact your HR department.',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#f1b44c'
          });
        } else if (error.error?.errors?.email) {
          this.error = error.error.errors.email[0];
        } else {
          this.error = error.error?.message || 'An error occurred during registration. Please try again.';
        }
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
   * Navigate back to login
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}

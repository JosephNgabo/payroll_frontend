import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-recoverpwd2',
  templateUrl: './recoverpwd2.component.html',
  styleUrls: ['./recoverpwd2.component.scss'],
  standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,SlickCarouselModule, RouterModule]
})
export class Recoverpwd2Component implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();

  resetForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  success: any = '';
  loading: any = false;

  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private userService: UserService) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.success = '';
    this.error = '';
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }

    // Debug log
    console.log('Submitting forgot password for:', this.f.email.value);

    this.loading = true;
    this.userService.forgotPassword(this.f.email.value).subscribe({
      next: (res) => {
        this.success = 'Check your email for reset instructions.';
        this.loading = false;
        this.resetForm.reset();
        this.submitted = false;
        console.log('Forgot password success:', res);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to send reset instructions. Please try again.';
        this.loading = false;
        console.log('Forgot password error:', err);
      }
    });
  }
  // swiper config
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: true
  };
}

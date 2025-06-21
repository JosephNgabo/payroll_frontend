import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
// import { UserProfileService } from '../../../core/services/user.service';
import { Store } from '@ngrx/store';
import { Register } from 'src/app/store/Authentication/authentication.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone:true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule, RouterModule]
})
export class SignupComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  successmsg: any = false;
  fieldTextType: boolean = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
     public store: Store) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      phone: ['', Validators.required],
      title: ['', Validators.required],
      language: ['en', [Validators.required, Validators.pattern(/^(en|fr)$/)]], // Default to 'en', validate for 'en' or 'fr'
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * Toggle password visibility
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    const { firstname, lastname, username, phone, title, language, email, password } = this.signupForm.value;

    //Dispatch Action - Note: You will need to update your NgRx 'Register' action and reducer to handle all these new fields.
    this.store.dispatch(Register({ email: email, username: username, password: password }));
    // For now, I'm passing only email, username, and password as per the existing Register action signature.
    // You'll need to modify your NgRx 'Register' action and reducer to handle 'firstname', 'lastname', 'phone', 'title', 'language'.
  }
}

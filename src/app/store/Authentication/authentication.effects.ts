import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  login,
  loginSuccess,
  loginFailure,
  Register,
  RegisterSuccess,
  RegisterFailure,
  logout
} from './authentication.actions';
import { User } from 'src/app/core/models/auth.models';
import { UserProfileService } from 'src/app/core/services/user-profile.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from 'src/app/core/services/authfake.service';

@Injectable()
export class AuthenticationEffects {

  constructor(
    private actions$: Actions,
    private AuthenticationService: AuthenticationService,
    private AuthfakeService: AuthfakeauthenticationService,
    private userProfileService: UserProfileService,
    private router: Router) { }

  Register = createEffect(() =>
    this.actions$.pipe(
      ofType(Register),
      switchMap(payload => {
        // Create a user object that matches the expected type
        const user: User = {
          id: '', // ID will be generated by the backend
          username: payload.username,
          email: payload.email,
          title: 'user', // Default title
          user_profile: '',
          language: 'en', // Default language
          is_active: 1 // Default to active
        };
        return this.userProfileService.register(user).pipe(
          map((response) => {
            return RegisterSuccess({ user: response });
          }),
          catchError((error) => {
            return of(RegisterFailure({ error: error }));
          })
        );
      })
    )
  );

  Login = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(payload =>
        this.AuthfakeService.login(payload.email, payload.password).pipe(
          map(user => loginSuccess({ user })),
          catchError(error => of(loginFailure({ error })))
        )
      ),
    )
  );

  loginSuccess = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      tap(action => {
        sessionStorage.setItem('currentUser', JSON.stringify(action.user));
        this.router.navigate(['/']);
      })
    ), { dispatch: false }
  );

  logout = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => {
        this.AuthfakeService.logout();
      })
    ), { dispatch: false }
  );

}
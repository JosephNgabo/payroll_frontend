import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from './services/auth.service';
import { AuthfakeauthenticationService } from './services/authfake.service';
import { AuthGuard } from './guards/auth.guard';
import { LaravelAuthGuard } from './guards/laravel-auth.guard';
import { LaravelAuthService } from './services/laravel-auth.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardService } from './services/dashboard.service';
import { DashboardWidgetsService } from './services/dashboard-widgets.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    AuthenticationService,
    AuthfakeauthenticationService,
    AuthGuard,
    LaravelAuthGuard,
    LaravelAuthService,
    DashboardService,
    DashboardWidgetsService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class CoreModule { }

// import { enableProdMode } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import { environment } from './environments/environment';

// if (environment.production) {
//   enableProdMode();
// }
// enableProdMode();
// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));


import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
import { initFirebaseBackend } from './app/authUtils';
import { FakeBackendInterceptor } from './app/core/helpers/fake-backend';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { JwtInterceptor } from './app/core/helpers/jwt.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';

// Enable production mode if in production environment
if (environment.production) {
  enableProdMode();
}

// Configure interceptors based on authentication type
const interceptors = [];

if (environment.defaultauth === 'firebase') {
  initFirebaseBackend(environment.firebaseConfig);
} else if (environment.defaultauth === 'laravel') {
  // Use Laravel authentication interceptor
  interceptors.push({ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true });
} else {
  // Use fake backend for development/testing
  interceptors.push({ provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true });
}

// Always include error interceptor
interceptors.push({ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true });

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...interceptors,
    ...appConfig.providers
  ]
})
.catch((err) => console.error('Error during bootstrapping the application:', err));


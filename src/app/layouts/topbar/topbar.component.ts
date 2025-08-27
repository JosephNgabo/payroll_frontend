import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { LaravelAuthService } from '../../core/services/laravel-auth.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { changesLayout } from 'src/app/store/layouts/layout.actions';
import { getLayoutMode } from 'src/app/store/layouts/layout.selector';
import { RootReducerState } from 'src/app/store';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SimplebarAngularModule } from 'simplebar-angular';
import { EmployeeTimeOffRequestsAdminService } from '../../core/services/employee-time-off-requests-admin.service';
import { WorkflowService } from '../../core/services/workflow.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, BsDropdownModule, SimplebarAngularModule],
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {
  mode: any
  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  theme: any;
  layout: string;
  dataLayout$: Observable<string>;
  // Define layoutMode as a property

  constructor(
    @Inject(DOCUMENT) private document: any, 
    private router: Router, 
    private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    private laravelAuthService: LaravelAuthService,
    public languageService: LanguageService,
    public translate: TranslateService,
    public _cookiesService: CookieService, 
    public store: Store<RootReducerState>,
    private employeeTimeOffRequestsAdminService: EmployeeTimeOffRequestsAdminService,
    private workflowService: WorkflowService
  ) {

  }

  listLang: any = [
    // { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    // { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    // { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    // { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    // { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  openMobileMenu: boolean;
  pendingRequestsCount: number = 5; // Hardcoded for now
  pendingPayrollsCount: number = 0; // Pending payroll approvals count

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    // this.initialAppState = initialState;
    this.store.select('layout').subscribe((data) => {
      this.theme = data.DATA_LAYOUT;
    })
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
    } else {
      this.flagvalue = val.map(element => element.flag);
    }

    // Load pending requests count
    this.loadPendingRequestsCount();
    this.loadPendingPayrollsCount();
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Navigate to pending requests page
   */
  navigateToPendingRequests() {
    this.router.navigate(['/pending-requests']);
  }

  /**
   * Navigate to pending payroll approvals page
   */
  navigateToPendingPayrollApprovals() {
    this.router.navigate(['/pending-payroll-approvals']);
  }

  /**
   * Load pending requests count from API
   */
  loadPendingRequestsCount() {
    this.employeeTimeOffRequestsAdminService.getPendingEmployeeTimeOffRequests()
      .subscribe({
        next: (requests) => {
          this.pendingRequestsCount = requests.length;
        },
        error: (error) => {
          console.error('Error loading pending requests count:', error);
          // Keep the default count if API fails
        }
      });
  }

  /**
   * Load pending payrolls count from API
   */
  loadPendingPayrollsCount() {
    this.workflowService.getPendingPayrollApprovalsCount()
      .subscribe({
        next: (count) => {
          this.pendingPayrollsCount = count;
        },
        error: (error) => {
          console.error('Error loading pending payrolls count:', error);
          // Keep the default count if API fails
          this.pendingPayrollsCount = 0;
        }
      });
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    if (environment.defaultauth === 'firebase') {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } else if (environment.defaultauth === 'laravel') {
      this.laravelAuthService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Even if logout API fails, redirect to login
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.authFackservice.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  changeLayout(layoutMode: string) {
    this.theme = layoutMode;
    this.store.dispatch(changesLayout({ layoutMode }));
    this.store.select(getLayoutMode).subscribe((layout) => {
      document.documentElement.setAttribute('data-layout', layout)
    })
  }

  get currentUserDisplayName(): string {
    const user = this.laravelAuthService.getCurrentUser();
    if (!user) return '';
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (user.username) return user.username;
    return user.email || '';
  }
}
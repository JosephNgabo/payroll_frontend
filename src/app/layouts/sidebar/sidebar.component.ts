import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone:true,
  imports:[SimplebarAngularModule,RouterModule,CommonModule,TranslateModule ]
})

/**
 * Sidebar component
 */
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;

  menuItems: MenuItem[] = [];

  @ViewChild('sideMenu') sideMenu: ElementRef;

  constructor(
    private eventService: EventService, 
    private router: Router, 
    public translate: TranslateService, 
    private http: HttpClient
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleSidebarOnRoute(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() {
    this.initialize();
    this._scrollElement();
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
          if (this.scrollRef.SimpleBar !== null)
            this.scrollRef.SimpleBar.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    }, 300);
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    const paths = [];
    Array.from(links).forEach((link) => {
      paths.push(link['pathname']);
    });
    const matchingMenuItem = paths.find((path) => {
      const pathname = window.location.pathname;
      if (pathname === path) {
        return true;
      }
      if (pathname.charAt(0) !== '/' && pathname.charAt(pathname.length - 1) !== '/') {
        if (pathname + '/' === path) {
          return true;
        }
      }
      if (path.charAt(0) !== '/' && path.charAt(path.length - 1) !== '/') {
        if (path + '/' === pathname) {
          return true;
        }
      }
      return false;
    });
    if (matchingMenuItem == null) {
      const activeId = sessionStorage.getItem('active_ul');
      if (activeId) {
        document.getElementById(activeId)?.classList.add('mm-show');
      }
    } else {
      menuItemEl = document.querySelector('[href="' + matchingMenuItem + '"]');
      if (menuItemEl) {
        menuItemEl.classList.add('active');
        const parentEl = menuItemEl.parentElement;
        if (parentEl) {
          parentEl.classList.add('mm-active');
          const parent2El = parentEl.parentElement.closest('ul');
          if (parent2El && parent2El.id !== 'side-menu') {
            parent2El.classList.add('mm-show');
            const parent3El = parent2El.parentElement;
            if (parent3El && parent3El.id !== 'side-menu') {
              parent3El.classList.add('mm-active');
              const childAnchor = parent3El.querySelector('.has-arrow');
              const childDropdown = parent3El.querySelector('.has-dropdown');
              if (childAnchor) childAnchor.classList.add('mm-active');
              if (childDropdown) childDropdown.classList.add('mm-show');
              const parent4El = parent3El.parentElement;
              if (parent4El && parent4El.id !== 'side-menu') {
                parent4El.classList.add('mm-show');
                const parent5El = parent4El.parentElement;
                if (parent5El && parent5El.id !== 'side-menu') {
                  parent5El.classList.add('mm-active');
                  const childanchor = parent5El.querySelector('.is-parent');
                  if (childanchor && parent5El.id !== 'side-menu') {
                    childanchor.classList.add('mm-active');
                  }
                }
              }
            }
            sessionStorage.setItem('active_ul', parent2El.id);
          } else {
            sessionStorage.removeItem('active_ul');
          }
        }
        sessionStorage.setItem('active_ul', parentEl.id);
      }
    }
  }

  /**
   * Initialize
   */
  initialize(): void {
    this.menuItems = MENU;
  }

  /**
   * Returns true or false if given menu has any child menu.
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  hideSidebar() {
    this.eventService.broadcast('collapse', true);
  }

  /**
   * Handles the click
   */
  handleSidebarOnRoute(url: string) {
    if (this.menu) {
      this.menu.dispose();
    }
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  /**
   * on menu click
   */
  onMenuItemClick(item: any) {
    if (item.subItems && item.subItems.length > 0) {
      return;
    }
    this.hideSidebar();
  }
}

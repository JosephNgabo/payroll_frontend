import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { BsModalService, BsModalRef, ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { EventService } from '../../../core/services/event.service';
import { ConfigService } from '../../../core/services/config.service';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TransactionComponent } from 'src/app/shared/widget/transaction/transaction.component';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { LoaderComponent } from 'src/app/shared/ui/loader/loader.component';
import { EmployeeDashboardComponent } from '../../employee-portal/dashboard/employee-dashboard.component';
import { EmployeePortalModule } from '../../employee-portal/employee-portal.module';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  standalone: true,
  imports: [PagetitleComponent, LoaderComponent, CommonModule, NgApexchartsModule, BsDropdownModule, ModalModule, TransactionComponent, EmployeePortalModule]
})
export class DefaultComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible: string;
  emailSentBarChart: ChartType;
  monthlyEarningChart: ChartType;
  transactions: any;
  statData: any;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  isActive: string;
  user:any;
  session=window.sessionStorage;

  @ViewChild('content') content;
  @ViewChild('center', { static: false }) center?: ModalDirective;

  constructor(
    private modalService: BsModalService,
    private configService: ConfigService,
    private eventService: EventService
  ) {
    let user=sessionStorage.getItem('current_user');
    this.user=JSON.parse(user);
    console.log(this.user);
    this.statData = [
      {
        title: 'Total Employees',
        value: '150',
        icon: 'mdi mdi-account-group'
      },
      {
        title: 'Active Projects',
        value: '12',
        icon: 'mdi mdi-briefcase'
      },
      {
        title: 'Leave Requests',
        value: '8',
        icon: 'mdi mdi-calendar'
      }
    ];

    this.transactions = [
      {
        id: 'EMP001',
        name: 'John Smith',
        date: '2024-03-15',
        total: '$4,500',
        status: 'Paid',
        payment: ['mdi mdi-bank', 'Bank Transfer']
      },
      {
        id: 'EMP002',
        name: 'Sarah Johnson',
        date: '2024-03-15',
        total: '$3,800',
        status: 'Pending',
        payment: ['mdi mdi-credit-card', 'Credit Card']
      },
      {
        id: 'EMP003',
        name: 'Michael Brown',
        date: '2024-03-15',
        total: '$5,200',
        status: 'Paid',
        payment: ['mdi mdi-bank', 'Bank Transfer']
      },
      {
        id: 'EMP004',
        name: 'Emily Davis',
        date: '2024-03-15',
        total: '$4,100',
        status: 'Failed',
        payment: ['mdi mdi-credit-card', 'Credit Card']
      },
      {
        id: 'EMP005',
        name: 'Robert Wilson',
        date: '2024-03-15',
        total: '$4,800',
        status: 'Paid',
        payment: ['mdi mdi-bank', 'Bank Transfer']
      }
    ];
  }

  ngOnInit() {
    const attribute = document.body.getAttribute('data-layout');
    this.isVisible = attribute;
    const vertical = document.getElementById('layout-vertical');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (attribute == 'horizontal') {
      const horizontal = document.getElementById('layout-horizontal');
      if (horizontal != null) {
        horizontal.setAttribute('checked', 'true');
      }
    }
    this.fetchData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.center?.show()
    }, 2000);
  }

  private fetchData() {
    this.emailSentBarChart = emailSentBarChart;
    this.monthlyEarningChart = monthlyEarningChart;
    this.isActive = 'year';
  }

  opencenterModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series = [{
      name: 'Annual Leave',
      data: [12, 15, 8, 10, 7, 9, 11]
    }, {
      name: 'Sick Leave',
      data: [5, 7, 4, 6, 3, 5, 4]
    }, {
      name: 'Emergency',
      data: [2, 3, 1, 2, 1, 2, 1]
    }];
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series = [{
      name: 'Annual Leave',
      data: [45, 52, 38, 45, 42, 48, 50]
    }, {
      name: 'Sick Leave',
      data: [15, 18, 12, 14, 10, 16, 13]
    }, {
      name: 'Emergency',
      data: [8, 10, 6, 7, 5, 8, 6]
    }];
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series = [{
      name: 'Annual Leave',
      data: [120, 135, 110, 125, 115, 130, 140]
    }, {
      name: 'Sick Leave',
      data: [45, 50, 40, 42, 38, 45, 48]
    }, {
      name: 'Emergency',
      data: [25, 30, 20, 22, 18, 25, 28]
    }];
  }

  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}

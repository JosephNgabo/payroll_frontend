import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="table-skeleton">
      <!-- Table Header -->
      <div class="table-header">
        <div class="row mb-2">
          <div class="col-sm-4">
            <div class="search-box me-2 mb-2 d-inline-block">
              <div class="position-relative">
                <app-skeleton type="text" width="100%" height="40px"></app-skeleton>
              </div>
            </div>
          </div>
          <div class="col-sm-8">
            <div class="text-sm-end">
              <app-skeleton type="button" width="180px" height="40px"></app-skeleton>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="table-body">
        <div class="table-responsive mb-0">
          <table class="table align-middle table-nowrap dt-responsive nowrap w-100 table-check">
            <thead class="table-light">
              <tr>
                <th style="width: 20px;">
                  <app-skeleton type="text" width="16px" height="16px"></app-skeleton>
                </th>
                <th class="align-middle">
                  <app-skeleton type="text" width="40px" height="16px"></app-skeleton>
                </th>
                <th class="align-middle">
                  <app-skeleton type="text" width="80px" height="16px"></app-skeleton>
                </th>
                <th class="align-middle">
                  <app-skeleton type="text" width="100px" height="16px"></app-skeleton>
                </th>
                <th class="align-middle">
                  <app-skeleton type="text" width="100px" height="16px"></app-skeleton>
                </th>
                <th class="align-middle">
                  <app-skeleton type="text" width="80px" height="16px"></app-skeleton>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of [].constructor(rowCount); let i = index">
                <td>
                  <app-skeleton type="text" width="16px" height="16px"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="text" width="60px" height="16px"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="text" width="120px" height="16px"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="text" width="200px" height="16px"></app-skeleton>
                </td>
                <td>
                  <app-skeleton type="button" width="100px" height="32px"></app-skeleton>
                </td>
                <td>
                  <div class="d-flex gap-3">
                    <app-skeleton type="text" width="20px" height="20px"></app-skeleton>
                    <app-skeleton type="text" width="20px" height="20px"></app-skeleton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="table-footer">
        <div class="d-flex justify-content-end">
          <app-skeleton type="text" width="200px" height="32px"></app-skeleton>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-skeleton {
      padding: 20px;
    }

    .table-header {
      margin-bottom: 20px;
    }

    .table-body {
      margin-bottom: 20px;
    }

    .table-footer {
      margin-top: 20px;
    }

    .table-skeleton table {
      border-collapse: separate;
      border-spacing: 0;
    }

    .table-skeleton th,
    .table-skeleton td {
      padding: 12px;
      border: none;
    }

    .table-skeleton tbody tr {
      border-bottom: 1px solid #f0f0f0;
    }

    .table-skeleton .d-flex.gap-3 {
      gap: 0.75rem !important;
    }
  `]
})
export class TableSkeletonComponent {
  @Input() columns: string[] = ['ID', 'Name', 'Description', 'Action'];
  @Input() rowCount: number = 5;

  getColumnWidth(column: string): string {
    switch (column.toLowerCase()) {
      case 'id':
        return '60px';
      case 'name':
        return '120px';
      case 'description':
        return '200px';
      case 'action':
        return '100px';
      default:
        return '100px';
    }
  }
} 
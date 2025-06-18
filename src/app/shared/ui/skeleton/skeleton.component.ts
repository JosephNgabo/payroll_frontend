import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngClass]="type" [style.width]="width" [style.height]="height">
      <div class="skeleton-animation"></div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      background: #f0f0f0;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .skeleton-animation {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }

    .text {
      height: 16px;
      margin-bottom: 8px;
    }

    .title {
      height: 24px;
      margin-bottom: 12px;
    }

    .avatar {
      border-radius: 50%;
    }

    .button {
      height: 36px;
      border-radius: 6px;
    }

    .table-row {
      height: 48px;
      margin-bottom: 4px;
    }

    .card {
      height: 120px;
      border-radius: 8px;
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'button' | 'table-row' | 'card' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '16px';
} 
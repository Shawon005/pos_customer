import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" [ngClass]="'toast-' + toast.type" [@slideIn]>
      <div class="toast-icon">
        <span *ngIf="toast.type === 'success'" class="icon">✓</span>
        <span *ngIf="toast.type === 'error'" class="icon">✕</span>
        <span *ngIf="toast.type === 'info'" class="icon">ℹ</span>
        <span *ngIf="toast.type === 'warning'" class="icon">!</span>
      </div>
      <div class="toast-message">{{ toast.message }}</div>
      <button class="toast-close" (click)="onClose()">×</button>
    </div>
  `,
  styles: [`
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      border-left: 4px solid #667eea;
      animation: slideIn 0.3s ease-out;
    }

    .toast-success {
      border-left-color: #27ae60;
      background: #f0fdf4;
    }

    .toast-error {
      border-left-color: #e74c3c;
      background: #fef2f2;
    }

    .toast-info {
      border-left-color: #3498db;
      background: #f0f9ff;
    }

    .toast-warning {
      border-left-color: #f39c12;
      background: #fffbf0;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
    }

    .toast-success .toast-icon {
      background: #27ae60;
    }

    .toast-error .toast-icon {
      background: #e74c3c;
    }

    .toast-info .toast-icon {
      background: #3498db;
    }

    .toast-warning .toast-icon {
      background: #f39c12;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      transition: color 0.2s;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      color: #333;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  @Input() toast!: Toast;
  @Output() close = new EventEmitter<string>();

  onClose(): void {
    this.close.emit(this.toast.id);
  }
}

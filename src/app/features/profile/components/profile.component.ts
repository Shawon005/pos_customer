import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Customer } from '../../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <header class="profile-header">
        <h1>Profile</h1>
      </header>

      <div class="content">
        <!-- Profile Info Card -->
        <div class="profile-card" *ngIf="customer">
          <div class="profile-avatar">
            <span class="avatar-icon">👤</span>
          </div>

          <div class="profile-info">
            <h2>{{ customer.name }}</h2>
            <p class="email">{{ customer.email }}</p>
            <p class="phone" *ngIf="customer.phone">📱 {{ customer.phone }}</p>
            <p class="address" *ngIf="customer.address">📍 {{ customer.address }}</p>
            <p class="member-since">Member since {{ customer.created_at | date: 'MMM yyyy' }}</p>
          </div>
        </div>

        <!-- Change Password Section -->
        <div class="section-card">
          <h3>Change Password</h3>

          <div class="form-group">
            <label for="old-pwd">Current Password</label>
            <input
              id="old-pwd"
              type="password"
              [(ngModel)]="oldPassword"
              placeholder="Enter current password"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="new-pwd">New Password</label>
            <input
              id="new-pwd"
              type="password"
              [(ngModel)]="newPassword"
              placeholder="Enter new password"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirm-pwd">Confirm Password</label>
            <input
              id="confirm-pwd"
              type="password"
              [(ngModel)]="confirmPassword"
              placeholder="Confirm new password"
              class="form-input"
            />
          </div>

          <button
            (click)="changePassword()"
            [disabled]="isChangingPassword"
            class="btn-primary"
          >
            <span *ngIf="!isChangingPassword">Update Password</span>
            <span *ngIf="isChangingPassword" class="spinner"></span>
          </button>
        </div>

        <!-- App Settings -->
        <div class="section-card">
          <h3>App Settings</h3>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Location Tracking</span>
              <span class="setting-desc">Send location every 3 minutes</span>
            </div>
            <input type="checkbox" [(ngModel)]="locationEnabled" (change)="toggleLocationTracking()" class="toggle" />
          </div>

          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-title">Push Notifications</span>
              <span class="setting-desc">Receive sale & stock alerts</span>
            </div>
            <input type="checkbox" [(ngModel)]="notificationsEnabled" class="toggle" />
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button (click)="logout()" class="btn-logout">
            🚪 Logout
          </button>
        </div>

        <!-- App Version -->
        <div class="footer">
          <p>Version 1.0.0</p>
          <p>© 2025 POS Customer App</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 16px;
      padding-bottom: 90px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .profile-header {
      margin-bottom: 24px;
    }

    .profile-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .profile-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      color: white;
      text-align: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 40px;
    }

    .profile-card h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }

    .profile-card p {
      margin: 4px 0;
      font-size: 13px;
      opacity: 0.9;
    }

    .email {
      margin: 8px 0 4px 0;
      font-size: 14px;
    }

    .member-since {
      margin-top: 12px;
      font-size: 12px;
      opacity: 0.8;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .section-card h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: #333;
      font-weight: 500;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .setting-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .setting-desc {
      font-size: 12px;
      color: #999;
    }

    .toggle {
      width: 48px;
      height: 28px;
      cursor: pointer;
      accent-color: #667eea;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      flex-direction: column;
    }

    .btn-logout {
      padding: 14px;
      background: #fee;
      color: #e74c3c;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout:active {
      background: #fdd;
      transform: scale(0.98);
    }

    .footer {
      text-align: center;
      padding: 20px 0;
      color: #999;
      font-size: 12px;
    }

    .footer p {
      margin: 4px 0;
    }

    @media (max-width: 480px) {
      .profile-page {
        padding: 12px;
      }

      .profile-card {
        padding: 20px;
      }

      .profile-avatar {
        width: 70px;
        height: 70px;
        font-size: 32px;
      }

      .profile-card h2 {
        font-size: 20px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  customer: Customer | null = null;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  locationEnabled = false;
  notificationsEnabled = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customer = this.authService.getCustomer();
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.notificationService.error('All fields are required');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.error('Passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.notificationService.error('Password must be at least 6 characters');
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.notificationService.success('Password changed successfully!');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (error) => {
        this.isChangingPassword = false;
        const message = error.error?.message || 'Failed to change password';
        this.notificationService.error(message);
      }
    });
  }

  toggleLocationTracking(): void {
    if (this.locationEnabled) {
      this.notificationService.success('Location tracking enabled');
    } else {
      this.notificationService.info('Location tracking disabled');
    }
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.info('Logged out successfully');
    this.router.navigate(['/auth/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Customer } from '../../../core/models/auth.model';
import { SunmiPrinterService } from '../../../core/services/sunmi-printer.service';

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

        <div class="section-card">
          <h3>Bluetooth Printer</h3>

          <p class="printer-note" *ngIf="!isNativeAndroid">
            Printer setup is available only in Android app.
          </p>

          <div class="form-group" *ngIf="isNativeAndroid">
            <label for="printer-device">Select Device</label>
            <select
              id="printer-device"
              class="form-input"
              [(ngModel)]="selectedPrinterAddress"
            >
              <option value="">Select paired bluetooth printer</option>
              <option *ngFor="let device of pairedPrinters" [value]="device.address">
                {{ device.name }} ({{ device.address }})
              </option>
            </select>
          </div>

          <div class="printer-actions" *ngIf="isNativeAndroid">
            <button
              (click)="scanPairedPrinters()"
              [disabled]="isScanningPrinters"
              class="btn-secondary-inline"
              type="button"
            >
              <span *ngIf="!isScanningPrinters">Scan Devices</span>
              <span *ngIf="isScanningPrinters" class="spinner-dark"></span>
            </button>
            <button
              (click)="connectSelectedPrinter()"
              [disabled]="isConnectingPrinter || !selectedPrinterAddress"
              class="btn-primary"
              type="button"
            >
              <span *ngIf="!isConnectingPrinter">Connect & Save</span>
              <span *ngIf="isConnectingPrinter" class="spinner"></span>
            </button>
          </div>

          <p class="printer-status" *ngIf="savedPrinterLabel">
            Saved printer: {{ savedPrinterLabel }}
          </p>
        </div>

        <!-- App Settings -->
        <!-- <div class="section-card">
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
        </div> -->

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
      background: linear-gradient(135deg,rgb(46, 44, 40) 0%,rgb(0, 0, 0) 100%);
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
      background: rgb(41,40,40);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .section-card h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #ffffff;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: #ffffff;
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

    .printer-note {
      margin: 0;
      font-size: 13px;
      color: #ddd;
    }

    .printer-actions {
      display: flex;
      gap: 8px;
    }

    .btn-secondary-inline {
      flex: 1;
      padding: 12px;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-secondary-inline:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .printer-status {
      margin: 10px 0 0;
      font-size: 12px;
      color: #e3e3e3;
    }

    .spinner-dark {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top-color: #333;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
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
  isNativeAndroid = false;
  pairedPrinters: Array<{ name: string; address: string }> = [];
  selectedPrinterAddress = '';
  savedPrinterLabel = '';
  isScanningPrinters = false;
  isConnectingPrinter = false;
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
    private printerService: SunmiPrinterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customer = this.authService.getCustomer();
    this.isNativeAndroid = this.printerService.isNativeAndroid();
    this.selectedPrinterAddress = this.printerService.getSelectedRongtaAddress();
    this.updateSavedPrinterLabel();
    if (this.isNativeAndroid) {
      this.scanPairedPrinters();
    }
  }

  async scanPairedPrinters(): Promise<void> {
    if (!this.isNativeAndroid) {
      return;
    }
    console.log('isNativeAndroid:', this.printerService.isNativeAndroid());
    
    this.isScanningPrinters = true;
    try {
      const devices = await this.printerService.listPairedRongtaDevices();
      this.pairedPrinters = devices;

      if (!devices.length) {
        this.notificationService.warning('No paired bluetooth devices found. Pair in Android Settings, then tap Scan Devices.');
        return;
      }

      if (this.selectedPrinterAddress && !devices.some(d => d.address === this.selectedPrinterAddress)) {
        this.selectedPrinterAddress = '';
      }
    } catch (error: any) {
      const message = error?.message || 'Unable to load paired bluetooth devices';
      this.notificationService.error(message);
    } finally {
      this.isScanningPrinters = false;
    }
  }

  async connectSelectedPrinter(): Promise<void> {
    if (!this.selectedPrinterAddress) {
      this.notificationService.warning('Select a printer device first');
      return;
    }

    this.isConnectingPrinter = true;
    const connected = await this.printerService.connectSelectedRongtaPrinter(this.selectedPrinterAddress);
    this.isConnectingPrinter = false;

    if (!connected) {
      this.notificationService.error('Printer connect failed. Check bluetooth and pairing.');
      return;
    }

    const matched = this.pairedPrinters.find(d => d.address === this.selectedPrinterAddress);
    this.printerService.setSelectedRongtaPrinter(this.selectedPrinterAddress, matched?.name || 'Rongta Printer');
    this.updateSavedPrinterLabel();
    this.notificationService.success('Printer connected and saved');
  }

  private updateSavedPrinterLabel(): void {
    const savedName = this.printerService.getSelectedRongtaName();
    const savedAddress = this.printerService.getSelectedRongtaAddress();
    this.savedPrinterLabel = savedAddress ? `${savedName || 'Rongta Printer'} (${savedAddress})` : '';
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

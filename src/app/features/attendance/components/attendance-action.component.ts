import { Component,ChangeDetectorRef } from '@angular/core';
import { AttendanceService } from '../services/attendance.service';
import {
  AttendanceSubmitRequest,
  AttendanceType,
  CreateLeaveRequestPayload,
  LeaveRequestItem,
  LeaveRequestStatus
} from '../models/attendance.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { firstValueFrom } from 'rxjs';

type AttendancePosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

@Component({
  selector: 'app-attendance-action',
  standalone: false,
  templateUrl: './attendance-action.component.html',
  styleUrls: ['./attendance-action.component.css']
})
export class AttendanceActionComponent {
  loading = false;
  captureLoading = false;
  previewImageBase64 = '';
  lastQueueCount = 0;
  leaveLoading = false;
  leaveListLoading = false;
  submitStatusMessage = '';
  submitStatusType: 'success' | 'error' | 'warning' | '' = '';
  leaveStatusFilter: LeaveRequestStatus | '' = 'pending';
  leaveRequests: LeaveRequestItem[] = [];
  leaveForm: CreateLeaveRequestPayload = {
    from_date: '',
    to_date: '',
    reason: ''
  };

  constructor(private attendanceService: AttendanceService, private notificationService: NotificationService,private cdr: ChangeDetectorRef,) {
    this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
    this.attendanceService.syncStatus$.subscribe(() => {
      this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
    });
    this.loadLeaveRequests();
  }

  async captureSelfie(): Promise<void> {
    this.captureLoading = true;
    try {
      const photo = await Camera.getPhoto({ quality: 75, resultType: CameraResultType.Base64, source: CameraSource.Camera, allowEditing: false });
      this.previewImageBase64 = photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : '';
    } catch {
      this.notificationService.warning('Photo capture skipped.');
    } finally {
      this.captureLoading = false;
    }
  }

  async submit(type: AttendanceType): Promise<void> {
    if (this.loading) return;
    try {
      this.loading = true;
      this.submitStatusMessage = '';
      this.submitStatusType = '';
      this.cdr.detectChanges();
      const permission = await Geolocation.requestPermissions();
      const locationPermission = permission?.location;
      const coarsePermission = permission?.coarseLocation;
      const isDenied = locationPermission === 'denied' || coarsePermission === 'denied';
      if (isDenied) {
        this.notificationService.error('Location permission is required.');
        return;
      }
      const position = await this.getPositionWithFallback();
      const payload: AttendanceSubmitRequest = {
        type,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        image_base64: this.previewImageBase64 ? this.previewImageBase64.split(',')[1] : undefined,
        created_at: new Date().toISOString()
      };
      console.log('Submitting attendance with payload:', payload);
      const response = await firstValueFrom(this.attendanceService.submitAttendance(payload));
      const message = response?.message || 'Attendance saved.';
      if (response?.success === false) {
        this.submitStatusMessage = message;
        this.submitStatusType = 'warning';
        this.notificationService.warning(message);
      } else if (/already|duplicate|exists/i.test(message)) {
        this.submitStatusMessage = message;
        this.submitStatusType = 'warning';
        this.notificationService.warning(message);
      } else {
        this.submitStatusMessage = message;
        this.submitStatusType = 'success';
        this.notificationService.success(message);
      }
      this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
      this.cdr.detectChanges();
    } catch (error: any) {
      const message = error?.message || 'Check-in failed. Please try again.';
      this.submitStatusMessage = message;
      this.submitStatusType = 'error';
      this.notificationService.error(message);
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async submitLeaveRequest(): Promise<void> {
    if (this.leaveLoading) return;
    if (!this.leaveForm.from_date || !this.leaveForm.to_date || !this.leaveForm.reason.trim()) {
      this.notificationService.warning('From date, to date and reason are required.');
      return;
    }
    if (this.leaveForm.from_date > this.leaveForm.to_date) {
      this.notificationService.warning('From date cannot be later than to date.');
      return;
    }

    this.leaveLoading = true;
    try {
      const payload: CreateLeaveRequestPayload = {
        from_date: this.leaveForm.from_date,
        to_date: this.leaveForm.to_date,
        reason: this.leaveForm.reason.trim()
      };
      const response = await firstValueFrom(this.attendanceService.createLeaveRequest(payload));
      if (response.success) {
        this.notificationService.success(response.message || 'Leave request submitted successfully.');
        this.leaveForm = { from_date: '', to_date: '', reason: '' };
        this.loadLeaveRequests();
      } else {
        this.notificationService.warning(response.message || 'Could not submit leave request.');
      }
    } catch (error: any) {
      this.notificationService.error(error?.message || 'Failed to submit leave request.');
    } finally {
      this.leaveLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadLeaveRequests(): void {
    this.leaveListLoading = true;
    this.attendanceService.getLeaveRequests(this.leaveStatusFilter || undefined).subscribe({
      next: (response) => {
        this.leaveRequests = response?.data || [];
        this.leaveListLoading = false;
      },
      error: (error) => {
        this.leaveListLoading = false;
        this.leaveRequests = [];
        this.notificationService.error(error?.message || 'Failed to load leave requests.');
      }
    });
  }

  getStatusClass(status: LeaveRequestStatus): string {
    return `status-${status}`;
  }

  trackByLeaveRequest(_: number, item: LeaveRequestItem): number {
    return item.id;
  }

  private async getPositionWithFallback(): Promise<AttendancePosition> {
    try {
      return await this.withTimeout(
        Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 }),
        18000,
        'Location request timed out.'
      );
    } catch {
      return await this.getBrowserPosition();
    }
  }

  private getBrowserPosition(): Promise<AttendancePosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => reject(new Error('Could not read your location.')),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

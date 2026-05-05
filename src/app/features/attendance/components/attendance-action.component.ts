import { Component,ChangeDetectorRef } from '@angular/core';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceSubmitRequest, AttendanceType } from '../models/attendance.model';
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

  constructor(private attendanceService: AttendanceService, private notificationService: NotificationService,private cdr: ChangeDetectorRef,) {
    this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
    this.attendanceService.syncStatus$.subscribe(() => {
      this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
    });
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
    
    try {
      
      this.cdr.detectChanges();
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
         this.loading = false;
        this.notificationService.error('Location permission is required.');
        this.loading = false;
        return;
      }
      this.loading = false;
      this.cdr.detectChanges();
      console.log('Submitting :');
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
      const message = response.message || 'Attendance saved.';
      if (/already|duplicate|exists/i.test(message)) {
        this.notificationService.warning(message);
      } else {
        this.notificationService.success(message);
      }
      this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
      this.cdr.detectChanges();
    } catch (error: any) {
      this.cdr.detectChanges();
      this.notificationService.error(error?.message || 'Could not read your location.');
    } finally {
      this.loading = false;
    }
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

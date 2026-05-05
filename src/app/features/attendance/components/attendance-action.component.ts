import { Component } from '@angular/core';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceSubmitRequest, AttendanceType } from '../models/attendance.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

  constructor(private attendanceService: AttendanceService, private notificationService: NotificationService) {
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
    this.loading = true;
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
        this.notificationService.error('Location permission is required.');
        return;
      }

      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      const payload: AttendanceSubmitRequest = {
        type,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        image_base64: this.previewImageBase64 ? this.previewImageBase64.split(',')[1] : undefined,
        created_at: new Date().toISOString()
      };

      this.attendanceService.submitAttendance(payload).subscribe({
        next: (response) => {
          const message = response.message || 'Attendance saved.';
          if (/already|duplicate|exists/i.test(message)) {
            this.notificationService.warning(message);
          } else {
            this.notificationService.success(message);
          }
          this.lastQueueCount = this.attendanceService.getQueuedAttendance().length;
        },
        error: (error: Error) => this.notificationService.error(error.message || 'Failed to submit attendance.')
      });
    } catch (error: any) {
      this.notificationService.error(error?.message || 'Could not read your location.');
    } finally {
      this.loading = false;
    }
  }
}

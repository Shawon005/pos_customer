import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { AttendanceRecord, AttendanceSummary } from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttendanceDateUtils } from '../utils/attendance-date.util';

@Component({
  selector: 'app-attendance-details',
  standalone: false,
  templateUrl: './attendance-details.component.html',
  styleUrls: ['./attendance-details.component.css']
})
export class AttendanceDetailsComponent implements OnInit {
  month = AttendanceDateUtils.toMonthInput();
  loading = false;
  syncing = false;
  rows: AttendanceRecord[] = [];
  pullDistance = 0;
  private startY = 0;
  readonly formatter = AttendanceDateUtils;
  
  summary: AttendanceSummary = {
    present_days: 0,
    worked_hours: '0h',
    late_hours: '0h',
    overtime_hours: '0h',
    base_salary: 0,
    late_deduction: 0,
    overtime_pay: 0,
    total_salary: 0,
    attendance_location: '-',
    salary:{ },
    today_work_location_name: '-'
  };
  today_work_location_name: string = '-';
  constructor(private attendanceService: AttendanceService, private notificationService: NotificationService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
    this.syncPending();
  }

  onMonthChange(): void { this.load(); }

  refresh(): void {
    this.syncPending();
    this.load();
  }

  onTouchStart(event: TouchEvent): void {
    if (window.scrollY === 0) this.startY = event.touches[0]?.clientY || 0;
  }

  onTouchMove(event: TouchEvent): void {
    if (window.scrollY > 0 || !this.startY) return;
    const currentY = event.touches[0]?.clientY || 0;
    this.pullDistance = Math.max(0, Math.min(90, currentY - this.startY));
  }

  onTouchEnd(): void {
    if (this.pullDistance > 70) this.refresh();
    this.pullDistance = 0;
    this.startY = 0;
  }

  trackByRow(index: number, row: AttendanceRecord): string {
    return `${row.type}_${row.time || row.date || index}`;
  }

  private load(): void {
    this.loading = true;
    this.attendanceService.getAttendanceDetails(this.month).subscribe({
      next: (response) => {
        this.summary = response.data?.summary || this.summary;
        this.today_work_location_name = response.data?.today_work_location_name || '-';
        this.rows = this.attendanceService.mergeQueuedWithServer(response.data?.records || []);
        this.loading = false;
         this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.loading = false;
        this.rows = this.attendanceService.mergeQueuedWithServer([]);
        this.notificationService.error(error.message || 'Failed to load attendance details.');
      }
    });
  }

  private syncPending(): void {
    this.syncing = true;
    this.attendanceService.syncQueuedAttendance().subscribe({
      next: () => { this.syncing = false; },
      error: () => { this.syncing = false; }
    });
  }
}

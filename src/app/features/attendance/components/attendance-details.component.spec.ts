import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AttendanceDetailsComponent } from './attendance-details.component';
import { AttendanceService } from '../services/attendance.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('AttendanceDetailsComponent', () => {
  let component: AttendanceDetailsComponent;
  let fixture: ComponentFixture<AttendanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceDetailsComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: AttendanceService,
          useValue: {
            getAttendanceDetails: () => of({ data: { summary: { present_days: 1, worked_hours: '8h', late_hours: '0h', overtime_hours: '0h', base_salary: 0, late_deduction: 0, overtime_pay: 0, total_salary: 0, attendance_location: 'HQ' }, records: [] } }),
            syncQueuedAttendance: () => of(0),
            mergeQueuedWithServer: (rows: any[]) => rows
          }
        },
        { provide: NotificationService, useValue: { error: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });
});

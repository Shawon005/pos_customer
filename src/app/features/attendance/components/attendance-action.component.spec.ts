import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceActionComponent } from './attendance-action.component';
import { AttendanceService } from '../services/attendance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('AttendanceActionComponent', () => {
  let component: AttendanceActionComponent;
  let fixture: ComponentFixture<AttendanceActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceActionComponent],
      providers: [
        {
          provide: AttendanceService,
          useValue: {
            getQueuedAttendance: () => [],
            submitAttendance: () => of({ message: 'ok' }),
            createLeaveRequest: () => of({ success: true, message: 'ok' }),
            getLeaveRequests: () => of({ success: true, data: [] }),
            syncStatus$: of(null)
          }
        },
        { provide: NotificationService, useValue: { success: () => {}, error: () => {}, warning: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });
});

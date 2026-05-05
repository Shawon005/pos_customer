import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AttendanceService } from './attendance.service';
import { AuthService } from '../../../core/services/auth.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => 'token-123' } }
      ]
    });

    service = TestBed.inject(AttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    spyOnProperty(navigator, 'onLine').and.returnValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('calls attendance submit API', () => {
    service.submitAttendance({ type: 'in', latitude: 1, longitude: 2 }).subscribe((res) => {
      expect(res.message).toBe('ok');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/customer/attendance'));
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ message: 'ok' });
  });
});

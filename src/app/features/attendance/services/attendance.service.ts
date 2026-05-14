import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  Observable,
  Subject,
  catchError,
  concatMap,
  defaultIfEmpty,
  from,
  last,
  map,
  of,
  throwError,
  timeout
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
  AttendanceApiResponse,
  CreateLeaveRequestPayload,
  CreateLeaveRequestResponse,
  AttendanceDetailsResponse,
  AttendanceQueueItem,
  AttendanceRecord,
  AttendanceSubmitRequest,
  LeaveRequestListResponse,
  LeaveRequestStatus
} from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly baseUrl = `${environment.apiUrl}/customer/attendance`;
  private readonly leaveRequestUrl = `${environment.apiUrl}/customer/leave-requests`;
  private readonly queueStorageKey = 'attendance_queue_v1';
  private readonly requestTimeoutMs = 20000;
  private readonly syncStatusSubject = new Subject<void>();
  readonly syncStatus$ = this.syncStatusSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService, private ngZone: NgZone) {
    window.addEventListener('online', () => this.ngZone.run(() => this.syncQueuedAttendance().subscribe()));
  }

  submitAttendance(payload: AttendanceSubmitRequest): Observable<AttendanceApiResponse> {
    if (!navigator.onLine) {
      this.queueAttendance(payload);
      return of({ message: 'Offline: attendance queued for sync.' });
    }
    return this.http
      .post<AttendanceApiResponse>(this.baseUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(timeout(this.requestTimeoutMs), catchError((error) => this.handleHttpError(error)));
  }

  getAttendanceDetails(month: string): Observable<AttendanceDetailsResponse> {
    const params = new HttpParams().set('month', month);
    return this.http
      .get<AttendanceDetailsResponse>(`${this.baseUrl}/details`, { headers: this.getAuthHeaders(), params })
      .pipe(timeout(this.requestTimeoutMs), catchError((error) => this.handleHttpError(error)));
  }

  createLeaveRequest(payload: CreateLeaveRequestPayload): Observable<CreateLeaveRequestResponse> {
    return this.http
      .post<CreateLeaveRequestResponse>(this.leaveRequestUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(timeout(this.requestTimeoutMs), catchError((error) => this.handleHttpError(error)));
  }

  getLeaveRequests(status?: LeaveRequestStatus): Observable<LeaveRequestListResponse> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http
      .get<LeaveRequestListResponse>(this.leaveRequestUrl, { headers: this.getAuthHeaders(), params })
      .pipe(timeout(this.requestTimeoutMs), catchError((error) => this.handleHttpError(error)));
  }

  getQueuedAttendance(): AttendanceQueueItem[] {
    try {
      const raw = localStorage.getItem(this.queueStorageKey);
      return raw ? (JSON.parse(raw) as AttendanceQueueItem[]) : [];
    } catch {
      return [];
    }
  }

  queueAttendance(payload: AttendanceSubmitRequest): void {
    const items = this.getQueuedAttendance();
    items.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      payload,
      queued_at: new Date().toISOString()
    });
    localStorage.setItem(this.queueStorageKey, JSON.stringify(items));
    this.syncStatusSubject.next();
  }

  syncQueuedAttendance(): Observable<number> {
    const queue = this.getQueuedAttendance();
    if (!queue.length || !navigator.onLine) return of(0);

    let syncedCount = 0;
    return from(queue).pipe(
      concatMap((item) =>
        this.http.post<AttendanceApiResponse>(this.baseUrl, item.payload, { headers: this.getAuthHeaders() }).pipe(
          timeout(this.requestTimeoutMs),
          map(() => {
            syncedCount += 1;
            this.removeQueueItem(item.id);
            return 0;
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 422 || error.status === 401) this.removeQueueItem(item.id);
            return of(0);
          })
        )
      ),
      defaultIfEmpty(0),
      last(),
      map(() => syncedCount),
      catchError(() => of(syncedCount))
    );
  }

  mergeQueuedWithServer(serverRecords: AttendanceRecord[]): AttendanceRecord[] {
    const queued = this.getQueuedAttendance().map((item) => ({
      type: item.payload.type,
      latitude: item.payload.latitude,
      longitude: item.payload.longitude,
      image_url: item.payload.image,
      date: item.payload.created_at || item.queued_at,
      time: item.payload.created_at || item.queued_at,
      sync_status: 'queued' as const,
      late_minutes: 0,
      distance_meters: 0,
      within_radius: false
    }));

    return [...queued, ...serverRecords.map((r) => ({ ...r, sync_status: 'synced' as const }))];
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  private removeQueueItem(id: string): void {
    const remaining = this.getQueuedAttendance().filter((i) => i.id !== id);
    localStorage.setItem(this.queueStorageKey, JSON.stringify(remaining));
    this.syncStatusSubject.next();
  }

  private handleHttpError(error: unknown): Observable<never> {
    if ((error as { name?: string })?.name === 'TimeoutError') {
      return throwError(() => new Error('Request timeout. Please try again.'));
    }
    const httpError = error as HttpErrorResponse;
    if (!navigator.onLine || httpError.status === 0) return throwError(() => new Error('No internet connection.'));
    if (httpError.status === 401) return throwError(() => new Error('Unauthorized. Please login again.'));
    if (httpError.status === 422) return throwError(() => new Error(httpError.error?.message || 'Validation failed.'));
    return throwError(() => new Error(httpError.error?.message || 'Unexpected server error.'));
  }
}

export type AttendanceType = 'in' | 'out';

export interface AttendanceSubmitRequest {
  type: AttendanceType;
  latitude: number;
  longitude: number;
  image?: string;
  image_base64?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id?: number;
  date?: string;
  type: AttendanceType;
  time?: string;
  late_minutes?: number;
  distance_meters?: number;
  within_radius?: boolean;
  latitude: number;
  longitude: number;
  image_url?: string;
  sync_status?: 'queued' | 'synced';
}

export interface AttendanceApiResponse {
  success?: boolean;
  message: string;
  data?: AttendanceRecord;
}

export interface AttendanceSummary {
  present_days: number;
  worked_hours: string;
  late_hours: string;
  overtime_hours: string;
  base_salary: number;
  late_deduction: number;
  overtime_pay: number;
  total_salary: number;
  attendance_location: string;
  salary: any;
  today_work_location_name: string;
}

export interface AttendanceDetailsResponse {
  message?: string;
  data: {
    today_work_location_name: string;
    summary: AttendanceSummary;
    records: AttendanceRecord[];
  };
}

export interface AttendanceQueueItem {
  id: string;
  payload: AttendanceSubmitRequest;
  queued_at: string;
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CreateLeaveRequestPayload {
  from_date: string;
  to_date: string;
  reason: string;
}

export interface LeaveRequestItem {
  id: number;
  from_date: string;
  to_date: string;
  days_count: number;
  reason: string;
  status: LeaveRequestStatus;
  admin_note: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface CreateLeaveRequestResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    status: LeaveRequestStatus;
    from_date: string;
    to_date: string;
    days_count: number;
  };
}

export interface LeaveRequestListResponse {
  success: boolean;
  data: LeaveRequestItem[];
}

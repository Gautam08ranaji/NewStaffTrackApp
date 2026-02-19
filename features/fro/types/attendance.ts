export interface AttendanceRecord {
  id: string;
  userId: string;
  punchInTime: string | null;
  punchOutTime: string | null;
  punchInLatitude: number | null;
  punchInLongitude: number | null;
  punchOutLatitude: number | null;
  punchOutLongitude: number | null;
  punchInAddress: string | null;
  punchOutAddress: string | null;
  attendanceStatus: string;
  createdOn: string;
}

export interface AttendanceListResponse {
  success: boolean;
  message?: string;
  data: {
    items: AttendanceRecord[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
}

// src/features/fro/types/addAttendance.ts

export interface AddAttendanceRequest {
  attendancedate: string; // YYYY-MM-DD
  checkintime: string; // ISO string
  checkouttime: string; // ISO string
  status: "Present" | "Absent" | "Leave";
  totalworkinghours: string; // e.g. "5:00"
  userId: string;
}

export type AvailabilityStatus =
  | "available"
  | "busy"
  | "in_meeting"
  | "unavailable";

export interface AvailabilityResponse {
  userId: string;
  role: "FRO" | "FRL";
  status: AvailabilityStatus;
  updatedAt: string;
}

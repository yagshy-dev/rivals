export type ActivityType = "RUNNING" | "CYCLING" | "SWIMMING" | "YOGA";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ActivitySubmissionResponse {
  id: string;
  targetSquadId: string;
  activityType: ActivityType;
  metricValue: number;
  status: SubmissionStatus;
  pointsAwarded: number | null;
  submittedAt: string;
}

export interface PendingSubmissionResponse {
  id: string;
  submitterDisplayName: string;
  activityType: ActivityType;
  metricValue: number;
  screenshotUrl: string;
  submittedAt: string;
}

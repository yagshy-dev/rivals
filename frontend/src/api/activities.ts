import { apiGet, apiPost, apiPostForm } from "./client";
import type {
  ActivitySubmissionResponse,
  ActivityType,
  PendingSubmissionResponse,
} from "../types";

export async function submitActivity(
  activityType: ActivityType,
  metricValue: number,
  screenshot: File,
): Promise<ActivitySubmissionResponse> {
  const form = new FormData();
  form.append("activityType", activityType);
  form.append("metricValue", String(metricValue));
  form.append("screenshot", screenshot);
  return apiPostForm<ActivitySubmissionResponse>("/activities", form);
}

export function getMySubmissions(): Promise<ActivitySubmissionResponse[]> {
  return apiGet<ActivitySubmissionResponse[]>("/activities/mine");
}

export function getPendingSubmissions(): Promise<PendingSubmissionResponse[]> {
  return apiGet<PendingSubmissionResponse[]>("/activities/pending");
}

export function approveSubmission(id: string): Promise<ActivitySubmissionResponse> {
  return apiPost<ActivitySubmissionResponse>(`/activities/${id}/approve`);
}

export function rejectSubmission(id: string): Promise<ActivitySubmissionResponse> {
  return apiPost<ActivitySubmissionResponse>(`/activities/${id}/reject`);
}

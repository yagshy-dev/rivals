import { apiGet } from "./client";
import type { UserSummaryResponse } from "../types";

export function searchUsers(search: string): Promise<UserSummaryResponse[]> {
  return apiGet<UserSummaryResponse[]>(`/users?search=${encodeURIComponent(search)}`);
}

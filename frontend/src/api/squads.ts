import { apiGet, apiPost } from "./client";
import type { SquadSummaryResponse } from "../types";

export function searchSquads(search: string): Promise<SquadSummaryResponse[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiGet<SquadSummaryResponse[]>(`/squads${query}`);
}

export function createSquad(name: string): Promise<SquadSummaryResponse> {
  return apiPost<SquadSummaryResponse>("/squads", { name });
}

export function joinSquad(id: string): Promise<SquadSummaryResponse> {
  return apiPost<SquadSummaryResponse>(`/squads/${id}/join`);
}

export function leaveSquad(id: string): Promise<SquadSummaryResponse> {
  return apiPost<SquadSummaryResponse>(`/squads/${id}/leave`);
}

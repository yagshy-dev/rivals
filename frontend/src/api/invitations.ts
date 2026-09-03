import { apiGet, apiPost } from "./client";
import type { SquadInvitationResponse } from "../types";

export function getMyInvitations(): Promise<SquadInvitationResponse[]> {
  return apiGet<SquadInvitationResponse[]>("/invitations");
}

export function acceptInvitation(id: string): Promise<SquadInvitationResponse> {
  return apiPost<SquadInvitationResponse>(`/invitations/${id}/accept`);
}

export function declineInvitation(id: string): Promise<SquadInvitationResponse> {
  return apiPost<SquadInvitationResponse>(`/invitations/${id}/decline`);
}

import { apiGet, apiPost } from "./client";
import type {
  ActivityType,
  SquadInvitationResponse,
  SquadMemberResponse,
  SquadSummaryResponse,
} from "../types";

export function searchSquads(search: string, mine = false): Promise<SquadSummaryResponse[]> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (mine) {
    params.set("mine", "true");
  }
  const query = params.toString();
  return apiGet<SquadSummaryResponse[]>(`/squads${query ? `?${query}` : ""}`);
}

/** FR-011, FR-046: `allowedActivityTypes` defaults to all four on the server when omitted/empty. */
export function createSquad(
  name: string,
  allowedActivityTypes?: ActivityType[],
): Promise<SquadSummaryResponse> {
  return apiPost<SquadSummaryResponse>("/squads", { name, allowedActivityTypes });
}

/** FR-012. Squads are invite-only (see `inviteToSquad`) — there is no self-service join. */
export function leaveSquad(id: string): Promise<SquadSummaryResponse> {
  return apiPost<SquadSummaryResponse>(`/squads/${id}/leave`);
}

export function getSquadMembers(id: string): Promise<SquadMemberResponse[]> {
  return apiGet<SquadMemberResponse[]>(`/squads/${id}/members`);
}

export function promoteMember(squadId: string, userId: string): Promise<SquadMemberResponse> {
  return apiPost<SquadMemberResponse>(`/squads/${squadId}/members/${userId}/promote`);
}

export function inviteToSquad(
  squadId: string,
  invitedUserId: string,
): Promise<SquadInvitationResponse> {
  return apiPost<SquadInvitationResponse>(`/squads/${squadId}/invitations`, { invitedUserId });
}

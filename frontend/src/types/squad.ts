export type SquadRole = "MANAGER" | "MEMBER";

export interface SquadSummaryResponse {
  id: string;
  name: string;
  memberCount: number;
  isCurrentUserMember: boolean;
  currentUserRole: SquadRole | null;
}

export interface SquadMemberResponse {
  userId: string;
  displayName: string;
  role: SquadRole;
  joinedAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface SquadInvitationResponse {
  id: string;
  squadId: string;
  squadName: string;
  invitedUserId: string;
  invitedByUserId: string;
  invitedByDisplayName: string;
  status: InvitationStatus;
  createdAt: string;
  decidedAt: string | null;
}

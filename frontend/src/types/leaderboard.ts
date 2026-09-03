export type SquadSortBy = "total" | "average";

export interface IndividualLeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
}

export interface SquadLeaderboardRow {
  rank: number;
  squadId: string;
  name: string;
  memberCount: number;
  totalPoints: number;
  averagePoints: number;
}

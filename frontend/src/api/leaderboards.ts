import { apiGet } from "./client";
import type { IndividualLeaderboardRow, SquadLeaderboardRow, SquadSortBy } from "../types";

export function getIndividualLeaderboard(squadId?: string): Promise<IndividualLeaderboardRow[]> {
  const query = squadId ? `?squadId=${encodeURIComponent(squadId)}` : "";
  return apiGet<IndividualLeaderboardRow[]>(`/leaderboards/individual${query}`);
}

export function getSquadLeaderboard(sortBy: SquadSortBy): Promise<SquadLeaderboardRow[]> {
  return apiGet<SquadLeaderboardRow[]>(`/leaderboards/squads?sortBy=${sortBy}`);
}

import { apiGet } from "./client";
import type { IndividualLeaderboardRow, SquadLeaderboardRow, SquadSortBy } from "../types";

export function getIndividualLeaderboard(): Promise<IndividualLeaderboardRow[]> {
  return apiGet<IndividualLeaderboardRow[]>("/leaderboards/individual");
}

export function getSquadLeaderboard(sortBy: SquadSortBy): Promise<SquadLeaderboardRow[]> {
  return apiGet<SquadLeaderboardRow[]>(`/leaderboards/squads?sortBy=${sortBy}`);
}

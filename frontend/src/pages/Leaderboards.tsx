import { useEffect, useState } from "react";
import { getIndividualLeaderboard, getSquadLeaderboard } from "../api/leaderboards";
import type { IndividualLeaderboardRow, SquadLeaderboardRow, SquadSortBy } from "../types";

export function Leaderboards() {
  const [individual, setIndividual] = useState<IndividualLeaderboardRow[] | null>(null);
  const [squadSortBy, setSquadSortBy] = useState<SquadSortBy>("total");
  const [squads, setSquads] = useState<SquadLeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getIndividualLeaderboard()
      .then(setIndividual)
      .catch(() => setError("Failed to load the individual leaderboard"));
  }, []);

  useEffect(() => {
    getSquadLeaderboard(squadSortBy)
      .then(setSquads)
      .catch(() => setError("Failed to load the squad leaderboard"));
  }, [squadSortBy]);

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Individual Leaderboard</h1>
        {!individual && <p className="text-gray-500">Loading...</p>}
        {individual && (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2">Rank</th>
                <th className="py-2">Name</th>
                <th className="py-2">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {individual.map((row) => (
                <tr key={row.userId} className="border-b border-gray-100">
                  <td className="py-2">{row.rank}</td>
                  <td className="py-2">{row.displayName}</td>
                  <td className="py-2">{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Squad Leaderboard</h1>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Sort by
            <select
              value={squadSortBy}
              onChange={(e) => setSquadSortBy(e.target.value as SquadSortBy)}
              className="rounded border border-gray-300 px-2 py-1"
            >
              <option value="total">Total points</option>
              <option value="average">Average points per member</option>
            </select>
          </label>
        </div>
        {!squads && <p className="text-gray-500">Loading...</p>}
        {squads && (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2">Rank</th>
                <th className="py-2">Squad</th>
                <th className="py-2">Members</th>
                <th className="py-2">Total Points</th>
                <th className="py-2">Average Points</th>
              </tr>
            </thead>
            <tbody>
              {squads.map((row) => (
                <tr key={row.squadId} className="border-b border-gray-100">
                  <td className="py-2">{row.rank}</td>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.memberCount}</td>
                  <td className="py-2">{row.totalPoints}</td>
                  <td className="py-2">{row.averagePoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

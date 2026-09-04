import { useEffect, useState } from "react";
import { Trophy, Users, Medal } from "lucide-react";
import { getIndividualLeaderboard, getSquadLeaderboard } from "../api/leaderboards";
import { searchSquads } from "../api/squads";
import type {
  IndividualLeaderboardRow,
  SquadLeaderboardRow,
  SquadSortBy,
  SquadSummaryResponse,
} from "../types";

const GLOBAL_VIEW = "GLOBAL";

export function Leaderboards() {
  const [individual, setIndividual] = useState<IndividualLeaderboardRow[] | null>(null);
  const [squadSortBy, setSquadSortBy] = useState<SquadSortBy>("total");
  const [squads, setSquads] = useState<SquadLeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mySquads, setMySquads] = useState<SquadSummaryResponse[]>([]);
  const [selectedView, setSelectedView] = useState<string>(GLOBAL_VIEW);

  useEffect(() => {
    searchSquads("", true)
      .then(setMySquads)
      .catch(() => setError("Failed to load your squads"));
  }, []);

  useEffect(() => {
    const squadId = selectedView === GLOBAL_VIEW ? undefined : selectedView;
    getIndividualLeaderboard(squadId)
      .then(setIndividual)
      .catch(() => setError("Failed to load the individual leaderboard"));
  }, [selectedView]);

  useEffect(() => {
    getSquadLeaderboard(squadSortBy)
      .then(setSquads)
      .catch(() => setError("Failed to load the squad leaderboard"));
  }, [squadSortBy]);

  return (
    <div className="flex flex-col gap-12">
      {error && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4 text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      {/* INDIVIDUAL LEADERBOARD SECTION */}
      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Medal className="h-6 w-6 text-orange-500" strokeWidth={2.5} />
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Individual Rankings
            </h1>
          </div>
          
          <label className="flex items-center gap-3 text-sm font-medium text-zinc-400">
            View
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="cursor-pointer rounded-full border border-zinc-800/80 bg-[#121214] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:border-zinc-600 focus:border-orange-500 focus:outline-none"
            >
              <option value={GLOBAL_VIEW}>🌎 Global Company</option>
              {mySquads.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!individual ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
            <p className="animate-pulse text-xs font-bold tracking-widest text-orange-500 uppercase">Loading Rankings...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#121214] shadow-xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                  <th className="px-6 py-5">Rank</th>
                  <th className="px-6 py-5">Athlete Name</th>
                  <th className="px-6 py-5 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {individual.map((row) => (
                  <tr key={row.userId} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold">
                      {row.rank === 1 ? (
                        <span className="flex items-center gap-2">
                          🏆 <span className="text-orange-500">1</span>
                        </span>
                      ) : (
                        <span className="text-zinc-200">{row.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-100">
                      {row.displayName}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-100">
                      {row.totalPoints.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SQUAD LEADERBOARD SECTION */}
      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-orange-500" strokeWidth={2.5} />
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Squad Leaderboard
            </h1>
          </div>
          
          <label className="flex items-center gap-3 text-sm font-medium text-zinc-400">
            Sort by
            <select
              value={squadSortBy}
              onChange={(e) => setSquadSortBy(e.target.value as SquadSortBy)}
              className="cursor-pointer rounded-full border border-zinc-800/80 bg-[#121214] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:border-zinc-600 focus:border-orange-500 focus:outline-none"
            >
              <option value="total">🔥 Total Points</option>
              <option value="average">📊 Average per Member</option>
            </select>
          </label>
        </div>

        {!squads ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
            <p className="animate-pulse text-xs font-bold tracking-widest text-orange-500 uppercase">Loading Squads...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#121214] shadow-xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                  <th className="px-6 py-5">Rank</th>
                  <th className="px-6 py-5">Squad Name</th>
                  <th className="px-6 py-5">Members</th>
                  <th className="px-6 py-5 text-right">Total Points</th>
                  <th className="px-6 py-5 text-right text-orange-500">Avg Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {squads.map((row) => (
                  <tr key={row.squadId} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold">
                      {row.rank === 1 ? (
                        <span className="flex items-center gap-2">
                          🏆 <span className="text-orange-500">1</span>
                        </span>
                      ) : (
                        <span className="text-zinc-200">{row.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-100">
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Users className="h-4 w-4 text-zinc-500" />
                        <span className="text-xs font-semibold">{row.memberCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-300">
                      {row.totalPoints.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-orange-500">
                      {row.averagePoints.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
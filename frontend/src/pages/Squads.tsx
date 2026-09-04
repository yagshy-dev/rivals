import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search, Swords } from "lucide-react";
import { createSquad, leaveSquad, searchSquads } from "../api/squads";
import { isApiError } from "../api/auth";
import { Icon } from "../components/Icon";
import type { ActivityType, SquadSummaryResponse } from "../types";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "RUNNING", label: "Running" },
  { value: "CYCLING", label: "Cycling" },
  { value: "SWIMMING", label: "Swimming" },
  { value: "YOGA", label: "Yoga" },
];

export function Squads() {
  const [search, setSearch] = useState("");
  const [squads, setSquads] = useState<SquadSummaryResponse[] | null>(null);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadTypes, setNewSquadTypes] = useState<Set<ActivityType>>(
    () => new Set(ACTIVITY_TYPES.map((t) => t.value)),
  );
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load(query: string) {
    searchSquads(query)
      .then(setSquads)
      .catch(() => setError("Failed to load squads"));
  }

  useEffect(() => load(""), []);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    load(search);
  }

  function toggleNewSquadType(type: ActivityType) {
    setNewSquadTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createSquad(newSquadName, Array.from(newSquadTypes));
      setNewSquadName("");
      setNewSquadTypes(new Set(ACTIVITY_TYPES.map((t) => t.value)));
      load(search);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to create squad");
    }
  }

  /** FR-012: leaving remains self-service; joining is invite-only (User Story 4). */
  async function handleLeave(squad: SquadSummaryResponse) {
    setBusyId(squad.id);
    setError(null);
    try {
      await leaveSquad(squad.id);
      load(search);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to leave squad");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Icon icon={Swords} className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Squads</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-[#121214] p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New squad name"
            value={newSquadName}
            onChange={(e) => setNewSquadName(e.target.value)}
            required
            className="flex-1 rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
          >
            Create
          </button>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Allowed activity types
          </p>
          <div className="flex flex-wrap gap-3">
            {ACTIVITY_TYPES.map((t) => (
              <label key={t.value} className="flex items-center gap-1.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={newSquadTypes.has(t.value)}
                  onChange={() => toggleNewSquadType(t.value)}
                  className="accent-orange-500"
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
      </form>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search squads by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-800/80 bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full border border-zinc-800/80 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
        >
          <Icon icon={Search} className="h-4 w-4" />
          Search
        </button>
      </form>

      {error && (
        <p className="mb-2 rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      {!squads && !error && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
          <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-orange-500">
            Loading Squads...
          </p>
        </div>
      )}
      {squads && squads.length === 0 && <p className="text-zinc-400">No squads found.</p>}

      <ul className="flex flex-col gap-2">
        {squads?.map((squad) => (
          <li
            key={squad.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 shadow-xl"
          >
            <div>
              {squad.isCurrentUserMember ? (
                <Link
                  to={`/squads/${squad.id}`}
                  className="font-bold text-orange-500 hover:text-orange-400"
                >
                  {squad.name}
                </Link>
              ) : (
                <p className="font-bold text-white">{squad.name}</p>
              )}
              <p className="text-sm text-zinc-400">
                {squad.memberCount} members
                {squad.currentUserRole ? ` · ${squad.currentUserRole}` : ""}
              </p>
              <p className="text-xs text-zinc-500">
                Allows: {squad.allowedActivityTypes.join(", ")}
              </p>
            </div>
            {/* FR-010, FR-012: squads are invite-only — no self-service "Join" control is ever
                offered here, only "Leave" for a squad the caller already belongs to. */}
            {squad.isCurrentUserMember ? (
              <button
                type="button"
                disabled={busyId === squad.id}
                onClick={() => void handleLeave(squad)}
                className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                Leave
              </button>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Invite-only
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

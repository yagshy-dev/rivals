import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createSquad, joinSquad, leaveSquad, searchSquads } from "../api/squads";
import { isApiError } from "../api/auth";
import type { SquadSummaryResponse } from "../types";

export function Squads() {
  const [search, setSearch] = useState("");
  const [squads, setSquads] = useState<SquadSummaryResponse[] | null>(null);
  const [newSquadName, setNewSquadName] = useState("");
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

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createSquad(newSquadName);
      setNewSquadName("");
      load(search);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to create squad");
    }
  }

  async function handleToggleMembership(squad: SquadSummaryResponse) {
    setBusyId(squad.id);
    setError(null);
    try {
      if (squad.isCurrentUserMember) {
        await leaveSquad(squad.id);
      } else {
        await joinSquad(squad.id);
      }
      load(search);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to update membership");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Squads</h1>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="New squad name"
          value={newSquadName}
          onChange={(e) => setNewSquadName(e.target.value)}
          required
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Create
        </button>
      </form>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search squads by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {!squads && !error && <p className="text-gray-500">Loading...</p>}
      {squads && squads.length === 0 && <p className="text-gray-500">No squads found.</p>}

      <ul className="flex flex-col gap-2">
        {squads?.map((squad) => (
          <li
            key={squad.id}
            className="flex items-center justify-between rounded border border-gray-200 p-3"
          >
            <div>
              {squad.isCurrentUserMember ? (
                <Link
                  to={`/squads/${squad.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {squad.name}
                </Link>
              ) : (
                <p className="font-medium text-gray-900">{squad.name}</p>
              )}
              <p className="text-sm text-gray-500">
                {squad.memberCount} members
                {squad.currentUserRole ? ` · ${squad.currentUserRole}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={busyId === squad.id}
              onClick={() => void handleToggleMembership(squad)}
              className={`rounded px-3 py-2 text-sm text-white disabled:opacity-50 ${
                squad.isCurrentUserMember
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {squad.isCurrentUserMember ? "Leave" : "Join"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

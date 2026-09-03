import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getSquadMembers, inviteToSquad, promoteMember } from "../api/squads";
import { searchUsers } from "../api/users";
import { isApiError, useAuth } from "../api/auth";
import type { SquadMemberResponse, UserSummaryResponse } from "../types";

export function SquadDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<SquadMemberResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteResults, setInviteResults] = useState<UserSummaryResponse[]>([]);
  const [inviteBusy, setInviteBusy] = useState(false);

  const squadId = id ?? "";
  const isManager =
    members?.some((m) => m.userId === user?.userId && m.role === "MANAGER") ?? false;

  function load() {
    getSquadMembers(squadId)
      .then(setMembers)
      .catch(() => setError("Failed to load squad members"));
  }

  useEffect(() => {
    if (squadId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squadId]);

  async function handleSearchInvitees(event: FormEvent) {
    event.preventDefault();
    if (!inviteQuery.trim()) {
      setInviteResults([]);
      return;
    }
    try {
      const results = await searchUsers(inviteQuery);
      setInviteResults(results);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to search employees");
    }
  }

  async function handleInvite(invitedUserId: string) {
    setInviteBusy(true);
    setError(null);
    try {
      await inviteToSquad(squadId, invitedUserId);
      setInviteResults((prev) => prev.filter((u) => u.id !== invitedUserId));
      setInviteQuery("");
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to send invite");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handlePromote(userId: string) {
    setBusyUserId(userId);
    setError(null);
    try {
      await promoteMember(squadId, userId);
      load();
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to promote member");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div>
      <Link to="/squads" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to Squads
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Squad Members</h1>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {!members && !error && <p className="text-gray-500">Loading...</p>}

      <ul className="mb-6 flex flex-col gap-2">
        {members?.map((member) => (
          <li
            key={member.userId}
            className="flex items-center justify-between rounded border border-gray-200 p-3"
          >
            <div>
              <p className="font-medium text-gray-900">{member.displayName}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
            {isManager && member.role === "MEMBER" && (
              <button
                type="button"
                disabled={busyUserId === member.userId}
                onClick={() => void handlePromote(member.userId)}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Promote to Manager
              </button>
            )}
          </li>
        ))}
      </ul>

      {isManager && (
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Invite Employee</h2>
          <form onSubmit={handleSearchInvitees} className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Search employees by name"
              value={inviteQuery}
              onChange={(e) => setInviteQuery(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Search
            </button>
          </form>
          <ul className="flex flex-col gap-2">
            {inviteResults.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3"
              >
                <span className="text-gray-900">{candidate.displayName}</span>
                <button
                  type="button"
                  disabled={inviteBusy}
                  onClick={() => void handleInvite(candidate.id)}
                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Invite
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpCircle, Search, UserPlus } from "lucide-react";
import { getSquadMembers, inviteToSquad, promoteMember } from "../api/squads";
import { searchUsers } from "../api/users";
import { isApiError, useAuth } from "../api/auth";
import { Icon } from "../components/Icon";
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
      <Link
        to="/squads"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-400"
      >
        <Icon icon={ArrowLeft} className="h-4 w-4" />
        Back to Squads
      </Link>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
        Squad Members
      </h1>

      {error && (
        <p className="mb-2 rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      {!members && !error && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
          <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-orange-500">
            Loading Members...
          </p>
        </div>
      )}

      <ul className="mb-6 flex flex-col gap-2">
        {members?.map((member) => (
          <li
            key={member.userId}
            className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 shadow-xl"
          >
            <div>
              <p className="font-bold text-white">{member.displayName}</p>
              <p className="text-sm text-zinc-400">{member.role}</p>
            </div>
            {isManager && member.role === "MEMBER" && (
              <button
                type="button"
                disabled={busyUserId === member.userId}
                onClick={() => void handlePromote(member.userId)}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
              >
                <Icon icon={ArrowUpCircle} className="h-4 w-4" />
                Promote to Manager
              </button>
            )}
          </li>
        ))}
      </ul>

      {isManager && (
        <div>
          <h2 className="mb-2 text-lg font-extrabold tracking-tight text-white">
            Invite Employee
          </h2>
          <form onSubmit={handleSearchInvitees} className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Search employees by name"
              value={inviteQuery}
              onChange={(e) => setInviteQuery(e.target.value)}
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
          <ul className="flex flex-col gap-2">
            {inviteResults.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 shadow-xl"
              >
                <span className="text-white">{candidate.displayName}</span>
                <button
                  type="button"
                  disabled={inviteBusy}
                  onClick={() => void handleInvite(candidate.id)}
                  className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
                >
                  <Icon icon={UserPlus} className="h-4 w-4" />
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

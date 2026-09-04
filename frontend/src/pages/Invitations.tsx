import { useEffect, useState } from "react";
import { Check, Mail, X } from "lucide-react";
import { acceptInvitation, declineInvitation, getMyInvitations } from "../api/invitations";
import { isApiError } from "../api/auth";
import { Icon } from "../components/Icon";
import { InvitationStatusBadge } from "../components/StatusBadge";
import type { SquadInvitationResponse } from "../types";

export function Invitations() {
  const [invitations, setInvitations] = useState<SquadInvitationResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    getMyInvitations()
      .then(setInvitations)
      .catch(() => setError("Failed to load invitations"));
  }

  useEffect(load, []);

  async function handleAccept(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await acceptInvitation(id);
      load();
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to accept invitation");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await declineInvitation(id);
      load();
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to decline invitation");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Icon icon={Mail} className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          My Invitations
        </h1>
      </div>

      {error && (
        <p className="mb-2 rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      {!invitations && !error && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
          <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-orange-500">
            Loading Invitations...
          </p>
        </div>
      )}
      {invitations && invitations.length === 0 && (
        <p className="text-zinc-400">You have no pending invitations.</p>
      )}

      <ul className="flex flex-col gap-2">
        {invitations?.map((invitation) => (
          <li
            key={invitation.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 shadow-xl"
          >
            <div>
              <p className="font-bold text-white">{invitation.squadName}</p>
              <p className="text-sm text-zinc-400">
                Invited by {invitation.invitedByDisplayName}
              </p>
              <div className="mt-1">
                <InvitationStatusBadge status={invitation.status} />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === invitation.id}
                onClick={() => void handleAccept(invitation.id)}
                className="flex items-center gap-2 rounded-full bg-approved px-4 py-2 text-sm font-semibold text-approved-fg hover:brightness-110 disabled:opacity-50"
              >
                <Icon icon={Check} className="h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                disabled={busyId === invitation.id}
                onClick={() => void handleDecline(invitation.id)}
                className="flex items-center gap-2 rounded-full border border-zinc-800/80 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50"
              >
                <Icon icon={X} className="h-4 w-4" />
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

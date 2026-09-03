import { useEffect, useState } from "react";
import { acceptInvitation, declineInvitation, getMyInvitations } from "../api/invitations";
import { isApiError } from "../api/auth";
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
      <h1 className="mb-4 text-xl font-semibold text-gray-900">My Invitations</h1>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {!invitations && !error && <p className="text-gray-500">Loading...</p>}
      {invitations && invitations.length === 0 && (
        <p className="text-gray-500">You have no pending invitations.</p>
      )}

      <ul className="flex flex-col gap-2">
        {invitations?.map((invitation) => (
          <li
            key={invitation.id}
            className="flex items-center justify-between rounded border border-gray-200 p-3"
          >
            <div>
              <p className="font-medium text-gray-900">{invitation.squadName}</p>
              <p className="text-sm text-gray-500">Invited by {invitation.invitedByDisplayName}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === invitation.id}
                onClick={() => void handleAccept(invitation.id)}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busyId === invitation.id}
                onClick={() => void handleDecline(invitation.id)}
                className="rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from "react";
import { approveSubmission, getPendingSubmissions, rejectSubmission } from "../api/activities";
import { isApiError } from "../api/auth";
import type { PendingSubmissionResponse } from "../types";

export function AdminReviewQueue() {
  const [submissions, setSubmissions] = useState<PendingSubmissionResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  function load() {
    getPendingSubmissions()
      .then(setSubmissions)
      .catch(() => setError("Failed to load the pending queue"));
  }

  useEffect(load, []);

  async function handleDecision(id: string, decide: (id: string) => Promise<unknown>) {
    setActingOnId(id);
    setError(null);
    try {
      await decide(id);
      setSubmissions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to record the decision");
    } finally {
      setActingOnId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Admin Review Queue</h1>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {!submissions && !error && <p className="text-gray-500">Loading...</p>}
      {submissions && submissions.length === 0 && (
        <p className="text-gray-500">No submissions awaiting review.</p>
      )}
      <ul className="flex flex-col gap-4">
        {submissions?.map((s) => (
          <li key={s.id} className="flex items-center gap-4 rounded border border-gray-200 p-4">
            <img
              src={s.screenshotUrl}
              alt="Submission evidence"
              className="h-20 w-20 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{s.submitterDisplayName}</p>
              <p className="text-sm text-gray-500">
                {s.activityType} — {s.metricValue}
              </p>
            </div>
            <button
              type="button"
              disabled={actingOnId === s.id}
              onClick={() => void handleDecision(s.id, approveSubmission)}
              className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={actingOnId === s.id}
              onClick={() => void handleDecision(s.id, rejectSubmission)}
              className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

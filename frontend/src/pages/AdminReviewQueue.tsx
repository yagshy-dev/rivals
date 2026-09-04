import { useEffect, useState } from "react";
import { Check, X, Loader2, Maximize2, ShieldCheck } from "lucide-react";
import { approveSubmission, getPendingSubmissions, rejectSubmission } from "../api/activities";
import { isApiError } from "../api/auth";
import { Icon } from "../components/Icon";
import type { PendingSubmissionResponse } from "../types";

export function AdminReviewQueue() {
  const [submissions, setSubmissions] = useState<PendingSubmissionResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  // Smart formatting based on your core rules
  const formatMetric = (type: string, value: number) => {
    return type.toUpperCase() === "YOGA" ? `${value} mins` : `${value.toFixed(1)} km`;
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Icon icon={ShieldCheck} className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Admin Review Queue
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
          {error}
        </p>
      )}
      {!submissions && !error && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
          <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-orange-500">
            Loading Queue...
          </p>
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/60 bg-[#121214] p-12">
          <Icon icon={Check} className="mb-2 h-10 w-10 text-zinc-500" />
          <p className="text-lg font-medium text-zinc-400">Queue is clear</p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {submissions?.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-[#121214] p-4 shadow-xl transition-colors hover:border-zinc-700/60 sm:flex-row sm:items-center"
          >
            {/* Clickable Image with Hover Overlay */}
            <div
              className="group relative h-24 w-24 cursor-pointer shrink-0 overflow-hidden rounded-xl border border-zinc-800/60"
              onClick={() => setZoomedImage(s.screenshotUrl)}
            >
              <img
                src={s.screenshotUrl}
                alt="Submission evidence"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Icon icon={Maximize2} className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <p className="text-lg font-bold text-white">{s.submitterDisplayName}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {s.activityType}
                </span>
                <span className="text-sm font-medium text-zinc-400">
                  {formatMetric(s.activityType, s.metricValue)}
                </span>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto sm:flex-col lg:flex-row">
              <button
                type="button"
                disabled={actingOnId === s.id}
                onClick={() => void handleDecision(s.id, approveSubmission)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-approved/15 px-4 py-2 text-sm font-semibold text-approved transition-colors hover:bg-approved hover:text-black disabled:opacity-50 sm:flex-none"
              >
                {actingOnId === s.id ? (
                  <Icon icon={Loader2} className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon icon={Check} className="h-4 w-4" />
                )}
                Approve
              </button>
              <button
                type="button"
                disabled={actingOnId === s.id}
                onClick={() => void handleDecision(s.id, rejectSubmission)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rejected/15 px-4 py-2 text-sm font-semibold text-rejected transition-colors hover:bg-rejected hover:text-white disabled:opacity-50 sm:flex-none"
              >
                {actingOnId === s.id ? (
                  <Icon icon={Loader2} className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon icon={X} className="h-4 w-4" />
                )}
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Fullscreen Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-h-full max-w-5xl">
            <button className="absolute -right-12 top-0 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
              <Icon icon={X} className="h-8 w-8" />
            </button>
            <img
              src={zoomedImage}
              alt="Expanded evidence"
              className="max-h-[90vh] w-auto rounded-2xl border border-zinc-800/60 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
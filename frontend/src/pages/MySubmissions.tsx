import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { getMySubmissions } from "../api/activities";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";
import type { ActivitySubmissionResponse } from "../types";

export function MySubmissions() {
  const [submissions, setSubmissions] = useState<ActivitySubmissionResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMySubmissions()
      .then(setSubmissions)
      .catch(() => setError("Failed to load your submissions"));
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Icon icon={ListChecks} className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          My Submissions
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
            Loading Submissions...
          </p>
        </div>
      )}
      {submissions && submissions.length === 0 && (
        <p className="text-zinc-400">No submissions yet.</p>
      )}
      {submissions && submissions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#121214] shadow-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                <th className="px-6 py-5">Activity</th>
                <th className="px-6 py-5">Value</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Points</th>
                <th className="px-6 py-5">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {submissions.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-bold text-zinc-100">{s.activityType}</td>
                  <td className="px-6 py-4 text-zinc-300">{s.metricValue}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-100">
                    {s.pointsAwarded ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

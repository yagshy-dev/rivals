import { useEffect, useState } from "react";
import { getMySubmissions } from "../api/activities";
import type { ActivitySubmissionResponse, SubmissionStatus } from "../types";

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

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
      <h1 className="mb-4 text-xl font-semibold text-gray-900">My Submissions</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!submissions && !error && <p className="text-gray-500">Loading...</p>}
      {submissions && submissions.length === 0 && (
        <p className="text-gray-500">No submissions yet.</p>
      )}
      {submissions && submissions.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">Activity</th>
              <th className="py-2">Value</th>
              <th className="py-2">Status</th>
              <th className="py-2">Points</th>
              <th className="py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="py-2">{s.activityType}</td>
                <td className="py-2">{s.metricValue}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-2">{s.pointsAwarded ?? "-"}</td>
                <td className="py-2">{new Date(s.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

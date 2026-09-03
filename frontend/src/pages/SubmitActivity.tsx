import { useState, type FormEvent } from "react";
import { submitActivity } from "../api/activities";
import { isApiError } from "../api/auth";
import type { ActivityType } from "../types";

const ACTIVITY_TYPES: { value: ActivityType; label: string; unit: string }[] = [
  { value: "RUNNING", label: "Running", unit: "km" },
  { value: "CYCLING", label: "Cycling", unit: "km" },
  { value: "SWIMMING", label: "Swimming", unit: "km" },
  { value: "YOGA", label: "Yoga", unit: "minutes" },
];

export function SubmitActivity() {
  const [activityType, setActivityType] = useState<ActivityType>("RUNNING");
  const [metricValue, setMetricValue] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const unit = ACTIVITY_TYPES.find((t) => t.value === activityType)?.unit ?? "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const parsedValue = Number(metricValue);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError(`${unit === "minutes" ? "Duration" : "Distance"} must be greater than 0`);
      return;
    }
    if (!screenshot) {
      setError("A screenshot is required");
      return;
    }

    setSubmitting(true);
    try {
      await submitActivity(activityType, parsedValue, screenshot);
      setSuccess(true);
      setMetricValue("");
      setScreenshot(null);
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Failed to submit activity");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Submit an Activity</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Activity type
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          {unit === "minutes" ? "Duration (minutes)" : "Distance (km)"}
          <input
            type="number"
            step="any"
            min="0"
            required
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Screenshot
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-700">
            Submitted! Your activity is now Pending admin approval.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

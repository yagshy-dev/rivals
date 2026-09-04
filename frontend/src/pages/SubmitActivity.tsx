import { useState, type FormEvent } from "react";
import { ClipboardList } from "lucide-react";
import { submitActivity } from "../api/activities";
import { isApiError } from "../api/auth";
import { Icon } from "../components/Icon";
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
      <div className="mb-5 flex items-center gap-3">
        <Icon icon={ClipboardList} className="h-6 w-6 text-orange-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Submit an Activity
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-[#121214] p-6 shadow-xl"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Activity type
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          {unit === "minutes" ? "Duration (minutes)" : "Distance (km)"}
          <input
            type="number"
            step="any"
            min="0"
            required
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Screenshot
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-orange-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black"
          />
        </label>
        {error && (
          <p className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm font-medium text-approved">
            Submitted! Your activity is now Pending admin approval.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

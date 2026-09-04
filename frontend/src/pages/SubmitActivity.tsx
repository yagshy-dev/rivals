import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { submitActivity } from "../api/activities";
import { searchSquads } from "../api/squads";
import { isApiError } from "../api/auth";
import { Icon } from "../components/Icon";
import type { ActivityType, SquadSummaryResponse } from "../types";

const ACTIVITY_TYPES: { value: ActivityType; label: string; unit: string }[] = [
  { value: "RUNNING", label: "Running", unit: "km" },
  { value: "CYCLING", label: "Cycling", unit: "km" },
  { value: "SWIMMING", label: "Swimming", unit: "km" },
  { value: "YOGA", label: "Yoga", unit: "minutes" },
];

export function SubmitActivity() {
  const [mySquads, setMySquads] = useState<SquadSummaryResponse[] | null>(null);
  const [targetSquadId, setTargetSquadId] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("RUNNING");
  const [metricValue, setMetricValue] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** FR-047: a user must belong to at least one Squad to submit, and picks the target Squad here. */
  useEffect(() => {
    searchSquads("", true)
      .then((squads) => {
        setMySquads(squads);
        if (squads[0]) {
          setTargetSquadId(squads[0].id);
        }
      })
      .catch(() => setError("Failed to load your squads"));
  }, []);

  const targetSquad = mySquads?.find((s) => s.id === targetSquadId) ?? null;
  const allowedTypes = ACTIVITY_TYPES.filter(
    (t) => targetSquad?.allowedActivityTypes.includes(t.value) ?? false,
  );
  const unit = allowedTypes.find((t) => t.value === activityType)?.unit ?? "km";

  /** FR-048: resets an Activity Type the newly selected Squad does not allow. */
  function handleTargetSquadChange(squadId: string) {
    setTargetSquadId(squadId);
    const squad = mySquads?.find((s) => s.id === squadId);
    if (squad && !squad.allowedActivityTypes.includes(activityType)) {
      setActivityType(squad.allowedActivityTypes[0] ?? "RUNNING");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!targetSquadId) {
      setError("You must select a squad to submit to");
      return;
    }
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
      await submitActivity(targetSquadId, activityType, parsedValue, screenshot);
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
      {mySquads === null && !error && (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-800/60 bg-[#121214]">
          <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-orange-500">
            Loading your squads...
          </p>
        </div>
      )}
      {mySquads?.length === 0 && (
        <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6 shadow-xl">
          <p className="mb-3 text-sm text-zinc-400">
            You must belong to a Squad before you can submit an activity. Squads are invite-only —
            ask a Squad Manager to invite you, or create your own.
          </p>
          <Link
            to="/squads"
            className="inline-block rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
          >
            Browse Squads
          </Link>
        </div>
      )}
      {mySquads !== null && mySquads.length > 0 && (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800/60 bg-[#121214] p-6 shadow-xl"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Squad
          <select
            value={targetSquadId}
            onChange={(e) => handleTargetSquadChange(e.target.value)}
            className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            {mySquads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Activity type
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            {allowedTypes.map((t) => (
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
      )}
    </div>
  );
}

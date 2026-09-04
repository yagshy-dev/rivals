import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth, isApiError } from "../api/auth";
import { Icon } from "../components/Icon";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(isApiError(err) ? err.response.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800/60 bg-[#121214] p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Icon icon={Trophy} className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-extrabold tracking-tight text-white">Log in to Rivals</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-400">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-400">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-800/80 bg-[#0a0a0b] px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-3 text-sm font-medium text-red-500">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

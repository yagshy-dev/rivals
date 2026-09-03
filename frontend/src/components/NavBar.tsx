import { NavLink } from "react-router-dom";
import { useAuth } from "../api/auth";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
  }`;

export function NavBar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-1">
        <NavLink to="/submit" className={linkClass}>
          Submit Activity
        </NavLink>
        <NavLink to="/my-submissions" className={linkClass}>
          My Submissions
        </NavLink>
        <NavLink to="/squads" className={linkClass}>
          Squads
        </NavLink>
        <NavLink to="/invitations" className={linkClass}>
          Invitations
        </NavLink>
        <NavLink to="/leaderboards" className={linkClass}>
          Leaderboards
        </NavLink>
        {user.role === "ADMIN" && (
          <NavLink to="/admin/queue" className={linkClass}>
            Admin Review Queue
          </NavLink>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {user.displayName} ({user.role})
        </span>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

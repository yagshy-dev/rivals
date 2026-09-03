import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../api/auth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-4 text-gray-500">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-4 text-gray-500">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./api/auth";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { SubmitActivity } from "./pages/SubmitActivity";
import { MySubmissions } from "./pages/MySubmissions";
import { AdminReviewQueue } from "./pages/AdminReviewQueue";
import { Squads } from "./pages/Squads";
import { SquadDetail } from "./pages/SquadDetail";
import { Invitations } from "./pages/Invitations";
import { Leaderboards } from "./pages/Leaderboards";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <main className="mx-auto max-w-4xl p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/submit" replace />} />
              <Route path="/submit" element={<SubmitActivity />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/squads" element={<Squads />} />
              <Route path="/squads/:id" element={<SquadDetail />} />
              <Route path="/invitations" element={<Invitations />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin/queue" element={<AdminReviewQueue />} />
            </Route>
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

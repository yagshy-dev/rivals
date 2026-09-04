import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./api/auth";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
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
        <Routes>
          {/* 1. PUBLIC ROUTES: No Sidebar, No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 2. LAYOUT ROUTE: Everything inside here gets the Sidebar */}
          <Route element={<AppLayout />}>
            
            {/* Standard User Pages */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/submit" replace />} />
              <Route path="/submit" element={<SubmitActivity />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/squads" element={<Squads />} />
              <Route path="/squads/:id" element={<SquadDetail />} />
              <Route path="/invitations" element={<Invitations />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
            </Route>

            {/* Admin Pages */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/queue" element={<AdminReviewQueue />} />
            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
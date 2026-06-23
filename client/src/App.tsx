import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Onboarding from "./pages/Onboarding"
import Welcome from "./pages/Welcome"
import Feed from "./pages/Feed"
import Profile, { ProfileRedirect } from "./pages/Profile"
import Matches from "./pages/Matches"
import Messages from "./pages/Messages"
import Terms from "./pages/Terms"
import Privacy from "./pages/Privacy"

import AdminDashboard from "./pages/admin/Dashboard"
import AdminUsers from "./pages/admin/Users"
import AdminReports from "./pages/admin/Reports"
import AdminSettings from "./pages/admin/Settings"

import ModeratorDashboard from "./pages/moderator/Dashboard"
import ModeratorReports from "./pages/moderator/Reports"
import SuspendedAccounts from "./pages/moderator/Suspended"

import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/common/ProtectedRoute"
import { RoleRoute } from "./components/common/RoleRoute"
import { AppLayout } from "./components/layouts/AppLayout"
import { CallHandler } from "./components/chat/CallHandler"
import { createStorageServices } from "./services/storage"
import type { IOnboardingStorage } from "./services/storage"

const { tokenStorage, userStorage, onboardingStorage } = createStorageServices()

function RootRedirect({ onboardingStorage }: { onboardingStorage: IOnboardingStorage }) {
  const { state } = useAuth()

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#487CFF] border-t-transparent" />
      </div>
    )
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!onboardingStorage.isCompleted()) {
    return <Navigate to="/onboarding" replace />
  }

  const role = state.user?.role
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />
  if (role === "moderator") return <Navigate to="/moderator/dashboard" replace />
  return <Navigate to="/feed" replace />
}

function App() {
  return (
    <AuthProvider tokenStorage={tokenStorage} userStorage={userStorage}>
      <CallHandler>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect onboardingStorage={onboardingStorage} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding onboardingStorage={onboardingStorage} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <Welcome onboardingStorage={onboardingStorage} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Feed />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfileRedirect />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Matches />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Messages />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Rutas de Administrador */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </RoleRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminUsers />
                  </AppLayout>
                </RoleRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminReports />
                  </AppLayout>
                </RoleRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminSettings />
                  </AppLayout>
                </RoleRoute>
              }
            />

            {/* Rutas de Moderador */}
            <Route
              path="/moderator/dashboard"
              element={
                <RoleRoute allowedRoles={["moderator", "admin"]}>
                  <AppLayout>
                    <ModeratorDashboard />
                  </AppLayout>
                </RoleRoute>
              }
            />
            <Route
              path="/moderator/reports"
              element={
                <RoleRoute allowedRoles={["moderator", "admin"]}>
                  <AppLayout>
                    <ModeratorReports />
                  </AppLayout>
                </RoleRoute>
              }
            />
            <Route
              path="/moderator/suspended"
              element={
                <RoleRoute allowedRoles={["moderator", "admin"]}>
                  <AppLayout>
                    <SuspendedAccounts />
                  </AppLayout>
                </RoleRoute>
              }
            />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </BrowserRouter>
      </CallHandler>
    </AuthProvider>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Onboarding from "./pages/Onboarding"
import Welcome from "./pages/Welcome"
import Feed from "./pages/Feed"
import Profile from "./pages/Profile"
import Matches from "./pages/Matches"
import Messages from "./pages/Messages"
import Terms from "./pages/Terms"
import Privacy from "./pages/Privacy"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/common/ProtectedRoute"
import { AppLayout } from "./components/layouts/AppLayout"
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

  return <Navigate to="/feed" replace />
}

function App() {
  return (
    <AuthProvider tokenStorage={tokenStorage} userStorage={userStorage}>
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
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

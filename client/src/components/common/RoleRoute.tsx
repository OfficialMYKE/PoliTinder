import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import type { UserRole } from "../../types/auth"

interface RoleRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleRoute({ children, allowedRoles, fallbackPath = "/feed" }: RoleRouteProps) {
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

  if (!allowedRoles.includes(state.user?.role ?? "student")) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

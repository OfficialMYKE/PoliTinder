import { useEffect, useState } from "react"
import { BarChart3, Users, Flag, Settings, GraduationCap, Shield, Crown } from "lucide-react"
import { getAdminStats } from "../../services/admin"
import type { AdminStats } from "../../services/admin"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#487CFF] border-t-transparent" />
      </div>
    )
  }

  const cards = [
    { label: "Total Usuarios", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600" },
    { label: "Estudiantes", value: stats?.studentsCount ?? 0, icon: GraduationCap, color: "text-green-600" },
    { label: "Moderadores", value: stats?.moderatorsCount ?? 0, icon: Shield, color: "text-purple-600" },
    { label: "Administradores", value: stats?.adminsCount ?? 0, icon: Crown, color: "text-yellow-600" },
    { label: "Publicaciones", value: stats?.totalPosts ?? 0, icon: BarChart3, color: "text-orange-600" },
    { label: "Reportes", value: stats?.pendingReports ?? 0, icon: Flag, color: "text-red-600" },
  ]

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Panel de Administración</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <card.icon className={`h-10 w-10 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Distribución de Roles</h2>
        <div className="space-y-3">
          {[
            { label: "Estudiantes", count: stats?.studentsCount ?? 0, color: "bg-green-500" },
            { label: "Moderadores", count: stats?.moderatorsCount ?? 0, color: "bg-purple-500" },
            { label: "Administradores", count: stats?.adminsCount ?? 0, color: "bg-yellow-500" },
          ].map((item) => {
            const total = (stats?.studentsCount ?? 0) + (stats?.moderatorsCount ?? 0) + (stats?.adminsCount ?? 0)
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.count} ({pct}%)</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

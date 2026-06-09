import { useEffect, useState } from "react"
import { Shield, Flag, UserCheck, BarChart3 } from "lucide-react"
import { supabase } from "../../services/supabase"

export default function ModeratorDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("post_comments").select("*", { count: "exact", head: true }),
    ])
      .then(([posts, profiles, comments]) => {
        setStats({
          totalPosts: posts.count ?? 0,
          totalUsers: profiles.count ?? 0,
          totalComments: comments.count ?? 0,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: "Usuarios registrados", value: stats.totalUsers, icon: UserCheck, color: "text-blue-600" },
    { label: "Publicaciones totales", value: stats.totalPosts, icon: BarChart3, color: "text-green-600" },
    { label: "Comentarios", value: stats.totalComments, icon: Shield, color: "text-purple-600" },
    { label: "Reportes pendientes", value: "—", icon: Flag, color: "text-yellow-600" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#487CFF] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-zinc-100">Panel de Moderación</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-zinc-100">{card.value}</p>
              </div>
              <card.icon className={`h-10 w-10 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-zinc-100">Resumen de Contenido</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-slate-50 dark:bg-zinc-800 p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.totalPosts}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Publicaciones</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-zinc-800 p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.totalComments}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Comentarios</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-zinc-800 p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.totalUsers}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Usuarios</p>
          </div>
        </div>
      </div>
    </div>
  )
}

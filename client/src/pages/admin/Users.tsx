import { useEffect, useState } from "react"
import { Search, Shield, UserX, Loader2 } from "lucide-react"
import { getAllProfiles, updateUserRole } from "../../services/admin"
import type { ProfileData } from "../../types/profile"
import type { UserRole } from "../../types/auth"

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Estudiante",
  moderator: "Moderador",
  admin: "Administrador",
}

const ROLE_COLORS: Record<UserRole, string> = {
  student: "bg-blue-50 text-blue-700",
  moderator: "bg-purple-50 text-purple-700",
  admin: "bg-yellow-50 text-yellow-700",
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    getAllProfiles()
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdating(userId)
    try {
      await updateUserRole(userId, newRole)
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = search
    ? profiles.filter(
        (p) =>
          p.nickname.toLowerCase().includes(search.toLowerCase()) ||
          p.career.toLowerCase().includes(search.toLowerCase()),
      )
    : profiles

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Gestión de Usuarios</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o carrera..."
            className="rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-zinc-400">
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-600 dark:text-zinc-300">Usuario</th>
              <th className="px-6 py-3 font-medium text-slate-600 dark:text-zinc-300">Facultad</th>
              <th className="px-6 py-3 font-medium text-slate-600 dark:text-zinc-300">Carrera</th>
              <th className="px-6 py-3 font-medium text-slate-600 dark:text-zinc-300">Rol</th>
              <th className="px-6 py-3 font-medium text-slate-600 dark:text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{p.nickname}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{p.faculty}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{p.career}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[p.role]}`}
                  >
                    {ROLE_LABELS[p.role]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={p.role}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                      disabled={updating === p.id}
                      className="rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="student">Estudiante</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                    {updating === p.id && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, Users, Plus, Search, Crown, UserPlus, UserMinus } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getGroups, joinGroup, leaveGroup, type Group } from "../services/groups"
import { Button } from "../components/ui/button"
import { FACULTIES } from "../data/academicData"

function getInitials(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

export default function GroupsList() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const userId = authState.user?.id

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadGroups()
  }, [facultyFilter])

  async function loadGroups() {
    setLoading(true)
    const data = await getGroups({
      faculty: facultyFilter || undefined,
      search: search || undefined,
      userId,
    })
    setGroups(data)
    setLoading(false)
  }

  async function handleSearch() {
    setLoading(true)
    const data = await getGroups({
      faculty: facultyFilter || undefined,
      search: search || undefined,
      userId,
    })
    setGroups(data)
    setLoading(false)
  }

  async function handleJoin(groupId: string) {
    if (!userId) return
    setActionLoading(groupId)
    const ok = await joinGroup(groupId, userId)
    if (ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, is_member: true, member_count: g.member_count + 1, user_role: "member" }
            : g
        )
      )
    }
    setActionLoading(null)
  }

  async function handleLeave(groupId: string) {
    if (!userId) return
    if (!confirm("¿Salir del grupo?")) return
    setActionLoading(groupId)
    const ok = await leaveGroup(groupId, userId)
    if (ok) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, is_member: false, member_count: Math.max(0, g.member_count - 1), user_role: null }
            : g
        )
      )
    }
    setActionLoading(null)
  }

  const filteredGroups = groups.filter((g) => {
    if (!search) return true
    const q = search.toLowerCase()
    return g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
  })

  return (
    <div className="mx-auto max-w-4xl px-6 pt-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Grupos de Estudio</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Conecta con estudiantes de tu misma carrera o facultad
            </p>
          </div>
          <Button
            onClick={() => navigate("/groups/create")}
            className="h-9 gap-1.5 rounded-full bg-[#487CFF] text-white px-4 text-xs font-medium shadow-sm hover:bg-[#3a6ae0]"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear grupo
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Buscar grupos..."
              className="h-10 w-full rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50 focus:border-[#487CFF]"
            />
          </div>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="h-10 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50"
          >
            <option value="">Todas las facultades</option>
            {FACULTIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mb-2">
            No hay grupos todavía
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
            Sé el primero en crear un grupo de estudio
          </p>
          <Button
            onClick={() => navigate("/groups/create")}
            className="h-9 gap-1.5 rounded-full bg-[#487CFF] text-white px-4 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear grupo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-[#487CFF]/10 to-[#487CFF]/20 relative">
                {group.cover_url && (
                  <img src={group.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="p-4">
                {/* Avatar + Name */}
                <div className="flex items-start gap-3 -mt-10 mb-3">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white dark:border-zinc-900 bg-[#487CFF] shadow-sm">
                    {group.avatar_url ? (
                      <img src={group.avatar_url} alt={group.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                        {getInitials(group.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-8">
                    <button
                      type="button"
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="text-left"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate hover:text-[#487CFF] transition-colors">
                        {group.name}
                      </h3>
                    </button>
                    {group.faculty && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {FACULTIES.find((f) => f.value === group.faculty)?.label ?? group.faculty}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {group.description && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3">
                    {group.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.member_count} miembro{group.member_count !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Creado {new Date(group.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 overflow-hidden rounded-full bg-[#487CFF]">
                    {group.creator_avatar ? (
                      <img src={group.creator_avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white">
                        {getInitials(group.creator_nickname ?? "?")}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Creado por <span className="font-medium text-slate-700 dark:text-zinc-300">{group.creator_nickname}</span>
                  </span>
                  {group.creator_id === userId && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    variant="outline"
                    className="flex-1 h-8 rounded-full border-slate-200 dark:border-zinc-700 text-xs font-medium"
                  >
                    Ver grupo
                  </Button>
                  {group.is_member ? (
                    group.user_role !== "admin" ? (
                      <Button
                        onClick={() => handleLeave(group.id)}
                        disabled={actionLoading === group.id}
                        variant="outline"
                        className="h-8 rounded-full border-red-200 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        {actionLoading === group.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserMinus className="h-3 w-3" />
                        )}
                      </Button>
                    ) : null
                  ) : (
                    <Button
                      onClick={() => handleJoin(group.id)}
                      disabled={actionLoading === group.id}
                      className="h-8 rounded-full bg-[#487CFF] text-white text-xs font-medium hover:bg-[#3a6ae0]"
                    >
                      {actionLoading === group.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Unirse
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  House,
  User,
  Heart,
  Users,
  MessageSquare,
  LogOut,
  ChevronUp,
  ChevronDown,
  Shield,
  BarChart3,
  Flag,
  Settings,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getProfile } from "../../services/profile"

const PERFIL_SUB_ITEMS = [
  "Informacion de seguridad",
  "Cambiar contrasena",
  "Configuracion y privacidad",
]

const MATCHES_SUB_ITEMS = [
  "Nuevos matches",
  "Solicitudes enviadas",
  "Perfiles bloqueados",
]

const GRUPOS_SUB_ITEMS = [
  "Mis grupos actuales",
  "Explorar grupos",
  "Invitaciones pendientes",
]

const MENSAJES_SUB_ITEMS = [
  "Chats recientes",
  "Archivados",
  "Solicitudes de mensaje",
]

const SUB_ITEM_CLASS =
  "flex w-full items-center px-4 py-2 pl-12 text-sm font-normal text-slate-500 transition-colors hover:text-[#106ebe]"

function getInitials(first: string, last: string): string {
  return `${(first?.charAt(0) ?? "").toUpperCase()}${(last?.charAt(0) ?? "").toUpperCase()}` || "?"
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state: authState, logout } = useAuth()
  const user = authState.user

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [perfilOpen, setPerfilOpen] = useState(true)
  const [matchesOpen, setMatchesOpen] = useState(true)
  const [gruposOpen, setGruposOpen] = useState(true)
  const [mensajesOpen, setMensajesOpen] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getProfile(user.id)
      .then((p) => {
        if (p?.avatar_url) setAvatarUrl(p.avatar_url)
      })
      .catch(() => {})
  }, [user?.id])

  const firstName = user?.firstName ?? ""
  const lastName = user?.lastName ?? ""
  const email = user?.email ?? ""
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = getInitials(firstName, lastName)

  return (
    <aside className="flex h-full w-60 flex-col bg-[#faf9f8]">
      {/* User profile section */}
      <div className="flex items-start gap-3 px-4 pt-6 pb-8">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0b6bcb] text-sm font-bold text-white select-none">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 uppercase truncate leading-tight">
            {fullName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            {email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-0">
        {/* Inicio */}
        <button
          type="button"
          onClick={() => navigate("/feed")}
          className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
            location.pathname === "/feed"
              ? "font-semibold text-slate-900"
              : "font-normal text-slate-700"
          }`}
        >
          {location.pathname === "/feed" && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
          )}
          <House
            className={`h-[18px] w-[18px] ${
              location.pathname === "/feed" ? "text-[#106ebe]" : "text-slate-500"
            }`}
          />
          Inicio
        </button>

        {/* Mi Perfil — active */}
        <div>
          <button
            type="button"
            onClick={() => {
              setPerfilOpen(!perfilOpen)
              navigate("/profile")
            }}
            className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
              location.pathname === "/profile"
                ? "font-semibold text-slate-900"
                : "font-normal text-slate-700"
            }`}
          >
            {location.pathname === "/profile" && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
            )}
            <User
              className={`h-[18px] w-[18px] ${
                location.pathname === "/profile" ? "text-[#106ebe]" : "text-slate-500"
              }`}
            />
            <span className="flex-1 text-left">Mi Perfil</span>
            {perfilOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400" />
            )}
          </button>

          {perfilOpen && (
            <div className="pb-1">
              {PERFIL_SUB_ITEMS.map((item) => (
                <button key={item} type="button" className={SUB_ITEM_CLASS}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mis Matches */}
        <div>
          <button
            type="button"
            onClick={() => setMatchesOpen(!matchesOpen)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-normal text-slate-700 transition-colors hover:text-[#106ebe]"
          >
            <Heart className="h-[18px] w-[18px] text-slate-500" />
            <span className="flex-1 text-left">Mis Matches</span>
            {matchesOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400" />
            )}
          </button>

          {matchesOpen && (
            <div className="pb-1">
              {MATCHES_SUB_ITEMS.map((item) => (
                <button key={item} type="button" className={SUB_ITEM_CLASS}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grupos de estudio */}
        <div>
          <button
            type="button"
            onClick={() => setGruposOpen(!gruposOpen)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-normal text-slate-700 transition-colors hover:text-[#106ebe]"
          >
            <Users className="h-[18px] w-[18px] text-slate-500" />
            <span className="flex-1 text-left">Grupos de estudio</span>
            {gruposOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400" />
            )}
          </button>

          {gruposOpen && (
            <div className="pb-1">
              {GRUPOS_SUB_ITEMS.map((item) => (
                <button key={item} type="button" className={SUB_ITEM_CLASS}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mensajes */}
        <div>
          <button
            type="button"
            onClick={() => setMensajesOpen(!mensajesOpen)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-normal text-slate-700 transition-colors hover:text-[#106ebe]"
          >
            <MessageSquare className="h-[18px] w-[18px] text-slate-500" />
            <span className="flex-1 text-left">Mensajes</span>
            {mensajesOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400" />
            )}
          </button>

          {mensajesOpen && (
            <div className="pb-1">
              {MENSAJES_SUB_ITEMS.map((item) => (
                <button key={item} type="button" className={SUB_ITEM_CLASS}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Administración — solo visible para admin */}
        {authState.user?.role === "admin" && (
          <div className="border-t border-slate-200 pt-2">
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Administración
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/dashboard")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <BarChart3 className="h-[18px] w-[18px] text-slate-500" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/users")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <Users className="h-[18px] w-[18px] text-slate-500" />
              Usuarios
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/reports")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/reports")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <Flag className="h-[18px] w-[18px] text-slate-500" />
              Reportes
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/settings")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/settings")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <Settings className="h-[18px] w-[18px] text-slate-500" />
              Configuración
            </button>
          </div>
        )}

        {/* Panel de Moderador — visible para moderator y admin */}
        {(authState.user?.role === "moderator" || authState.user?.role === "admin") && (
          <div className="border-t border-slate-200 pt-2">
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Moderación
            </p>
            <button
              type="button"
              onClick={() => navigate("/moderator/dashboard")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/dashboard")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <Shield className="h-[18px] w-[18px] text-slate-500" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/moderator/reports")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/reports")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <Flag className="h-[18px] w-[18px] text-slate-500" />
              Reportes
            </button>
            <button
              type="button"
              onClick={() => navigate("/moderator/suspended")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/suspended")
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-700"
              }`}
            >
              <User className="h-[18px] w-[18px] text-slate-500" />
              Suspendidas
            </button>
          </div>
        )}
      </nav>

      {/* Cerrar sesion */}
      <button
        type="button"
        onClick={() => {
          logout()
          navigate("/login")
        }}
        className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm font-normal text-slate-500 transition-colors hover:text-red-500 hover:bg-red-50"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Cerrar sesion
      </button>
    </aside>
  )
}

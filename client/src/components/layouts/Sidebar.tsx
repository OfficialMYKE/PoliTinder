import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  House,
  User,
  Heart,
  Users,
  MessageSquare,
  Crown,
  LogOut,
  Shield,
  BarChart3,
  Flag,
  Settings,
  Archive,
  UserPlus,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getProfile } from "../../services/profile"
import { getFriendRequestCount } from "../../services/friends"
import { getConversations } from "../../services/messages"
import type { ConversationWithLastMessage } from "../../types/message"
import { hasUnreadMessages } from "../../services/friends"
import type { ProfileData } from "../../types/profile"
import logoUrl from "../../assets/logo.png"
import { cn } from "../../lib/utils"

function getInitials(first: string, last: string): string {
  return (
    `${(first?.charAt(0) ?? "").toUpperCase()}${(last?.charAt(0) ?? "").toUpperCase()}` ||
    "?"
  )
}

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state: authState, logout } = useAuth()
  const user = authState.user

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showMatchesSub, setShowMatchesSub] = useState(false)
  const [showMessagesSub, setShowMessagesSub] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      const count = await getFriendRequestCount(user.id)
      setPendingRequests(count)
      const convs = await getConversations(user.id)
      const unread = convs.filter((c: ConversationWithLastMessage) =>
        hasUnreadMessages(c, user.id),
      ).length
      setUnreadCount(unread)
    }
    load()
    getProfile(user.id)
      .then((p) => {
        if (p) {
          if (p.avatar_url) setAvatarUrl(p.avatar_url)
        }
      })
      .catch(() => {})
  }, [user?.id])

  const firstName = user?.firstName ?? ""
  const lastName = user?.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = getInitials(firstName, lastName)

  function nav(path: string) {
    navigate(path)
  }

  function isActive(path: string, exact = false) {
    return exact ? location.pathname === path : location.pathname.startsWith(path)
  }

  const matchesActive = isActive("/matches")
  const messagesActive = isActive("/messages")

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800">
      {/* Logo — always left-aligned, consistent position */}
      <div className={cn("pt-4 pb-3", collapsed ? "px-3 flex justify-center" : "px-5")}>
        <button
          type="button"
          onClick={() => nav("/feed")}
          className="group relative flex items-center justify-center overflow-hidden"
        >
          <img src={logoUrl} alt="PoliTinder" className={cn("object-cover", collapsed ? "h-11 w-11 rounded-xl" : "h-8")} />
          {collapsed && <Tooltip>PoliTinder</Tooltip>}
        </button>
      </div>

      {/* User profile — only in expanded mode */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => nav(`/profile/${user?.id}`)}
            className="flex items-center gap-3 w-full text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl p-2"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#487CFF]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                Ver mi perfil
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Main navigation — same structure for both modes */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {/* Inicio */}
        <NavItem
          icon={House}
          label="Inicio"
          active={isActive("/feed", true)}
          onClick={() => nav("/feed")}
          collapsed={collapsed}
        />

        {/* Mi Perfil */}
        <NavItem
          icon={User}
          label="Mi Perfil"
          active={isActive("/profile")}
          onClick={() => nav(`/profile/${user?.id}`)}
          collapsed={collapsed}
        />

        {/* Mis Matches */}
        {collapsed ? (
          <NavItem
            icon={Heart}
            label="Mis Matches"
            active={matchesActive}
            onClick={() => nav("/matches")}
            collapsed={collapsed}
          />
        ) : (
          <div>
            <NavItem
              icon={Heart}
              label="Mis Matches"
              active={matchesActive}
              onClick={() => {
                setShowMatchesSub(!showMatchesSub)
                if (!matchesActive) nav("/matches")
              }}
              collapsed={collapsed}
              chevron
              chevronOpen={showMatchesSub}
            />
            {showMatchesSub && (
              <div className="ml-4 mt-0.5 space-y-0.5">
                <SubItem label="Nuevos matches" active={location.pathname === "/matches" && !location.search} onClick={() => nav("/matches")} />
                <SubItem label="Solicitudes enviadas" active={location.pathname === "/matches/sent-requests"} onClick={() => nav("/matches/sent-requests")} />
                <SubItem label="Perfiles bloqueados" active={location.pathname === "/matches/blocked"} onClick={() => nav("/matches/blocked")} />
              </div>
            )}
          </div>
        )}

        {/* Grupos */}
        <NavItem
          icon={Users}
          label="Grupos"
          active={isActive("/groups")}
          onClick={() => nav("/groups")}
          collapsed={collapsed}
        />

        {/* Mensajes */}
        {collapsed ? (
          <NavItem
            icon={MessageSquare}
            label="Mensajes"
            active={messagesActive}
            onClick={() => nav("/messages")}
            collapsed={collapsed}
            badge={unreadCount}
          />
        ) : (
          <div>
            <NavItem
              icon={MessageSquare}
              label="Mensajes"
              active={messagesActive}
              onClick={() => {
                setShowMessagesSub(!showMessagesSub)
                if (!messagesActive) nav("/messages")
              }}
              collapsed={collapsed}
              badge={unreadCount}
              chevron
              chevronOpen={showMessagesSub}
            />
            {showMessagesSub && (
              <div className="ml-4 mt-0.5 space-y-0.5">
                <SubItem label="Chats recientes" active={location.pathname === "/messages" && (!location.search || location.search.includes("tab=recientes"))} onClick={() => nav("/messages?tab=recientes")} badge={unreadCount} />
                <SubItem label="Archivados" icon={Archive} active={location.search.includes("tab=archivados")} onClick={() => nav("/messages?tab=archivados")} />
                <SubItem label="Solicitudes de mensaje" icon={UserPlus} active={location.search.includes("tab=solicitudes")} onClick={() => nav("/messages?tab=solicitudes")} badge={pendingRequests} />
              </div>
            )}
          </div>
        )}

        <div className="my-2 border-t border-slate-100 dark:border-zinc-800" />

        {/* Premium */}
        <NavItem
          icon={Crown}
          label="Premium"
          active={isActive("/premium", true)}
          onClick={() => nav("/premium")}
          collapsed={collapsed}
          iconColor="text-yellow-500"
        />

        {/* Admin */}
        {authState.user?.role === "admin" && (
          <>
            <div className="my-2 border-t border-slate-100 dark:border-zinc-800" />
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Administración
              </p>
            )}
            <NavItem icon={BarChart3} label="Dashboard" active={isActive("/admin/dashboard")} onClick={() => nav("/admin/dashboard")} collapsed={collapsed} />
            <NavItem icon={Flag} label="Reportes" active={isActive("/admin/reports")} onClick={() => nav("/admin/reports")} collapsed={collapsed} />
            {!collapsed && (
              <>
                <NavItem icon={Users} label="Usuarios" active={isActive("/admin/users")} onClick={() => nav("/admin/users")} collapsed={collapsed} />
                <NavItem icon={Settings} label="Configuración" active={isActive("/admin/settings")} onClick={() => nav("/admin/settings")} collapsed={collapsed} />
              </>
            )}
          </>
        )}

        {/* Moderator */}
        {(authState.user?.role === "moderator" || authState.user?.role === "admin") && (
          <>
            <div className="my-2 border-t border-slate-100 dark:border-zinc-800" />
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Moderación
              </p>
            )}
            <NavItem icon={Shield} label="Dashboard" active={isActive("/moderator/dashboard")} onClick={() => nav("/moderator/dashboard")} collapsed={collapsed} />
            {!collapsed && (
              <NavItem icon={Flag} label="Reportes" active={isActive("/moderator/reports")} onClick={() => nav("/moderator/reports")} collapsed={collapsed} />
            )}
          </>
        )}
      </nav>

      {/* Bottom section — avatar (collapsed) or logout (both) */}
      <div className={cn("pb-4", collapsed ? "px-3 flex flex-col items-center gap-1" : "px-3")}>
        {/* Avatar — only in collapsed mode */}
        {collapsed && (
          <button
            type="button"
            onClick={() => nav(`/profile/${user?.id}`)}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#487CFF] text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <Tooltip>Mi Perfil</Tooltip>
          </button>
        )}

        {/* Logout */}
        {collapsed ? (
          <div className="group relative">
            <button
              type="button"
              onClick={() => { logout(); nav("/login") }}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 dark:text-zinc-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <Tooltip>Cerrar sesión</Tooltip>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { logout(); nav("/login") }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-zinc-400 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ── Tooltip ──

function Tooltip({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">
      {children}
    </span>
  )
}

// ── NavItem — unified for both modes ──

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
  iconColor,
  chevron,
  chevronOpen,
  collapsed,
}: {
  icon: typeof House
  label: string
  active: boolean
  onClick: () => void
  badge?: number
  iconColor?: string
  chevron?: boolean
  chevronOpen?: boolean
  collapsed: boolean
}) {
  if (collapsed) {
    return (
      <div className="group relative">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            active
              ? "bg-[#487CFF]/10 text-[#487CFF]"
              : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300",
          )}
        >
          <Icon
            className={cn("h-5 w-5", active ? "text-[#487CFF]" : iconColor ?? "")}
            strokeWidth={active ? 2.5 : 2}
          />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#487CFF] px-1 text-[9px] font-bold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
        <Tooltip>{label}</Tooltip>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-[#487CFF]/10 text-[#487CFF]"
          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800",
      )}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", active ? "text-[#487CFF]" : iconColor ?? "")}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#487CFF] px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {chevron && (
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200",
            chevronOpen && "rotate-180",
          )}
        />
      )}
    </button>
  )
}

// ── SubItem — expanded only ──

function SubItem({
  label,
  active,
  onClick,
  badge,
  icon: Icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  badge?: number
  icon?: typeof Archive
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[#487CFF]/10 text-[#487CFF] font-medium"
          : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800",
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#487CFF] px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  House,
  User,
  Heart,
  Users,
  MessageSquare,
  Crown,
  LogOut,
  ChevronUp,
  ChevronDown,
  Shield,
  BarChart3,
  Flag,
  Settings,
  Archive,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile } from "../../services/profile";
import { getFriendRequestCount } from "../../services/friends";
import { getConversations } from "../../services/messages";
import type { ConversationWithLastMessage } from "../../types/message";
import { hasUnreadMessages } from "../../services/friends";
import type { ProfileData } from "../../types/profile";

const PERFIL_SUB_ITEMS = ["Cambiar contrasena", "Configuracion y privacidad"];

const MATCHES_SUB_ITEMS = [
  "Nuevos matches",
  "Solicitudes enviadas",
  "Perfiles bloqueados",
];

const GRUPOS_SUB_ITEMS = [
  "Mis grupos actuales",
  "Explorar grupos",
  "Invitaciones pendientes",
];

const MENSAJES_SUB_ITEMS = [
  "Chats recientes",
  "Archivados",
  "Solicitudes de mensaje",
];

const SUB_ITEM_CLASS =
  "flex w-full items-center px-4 py-2 pl-12 text-sm font-normal text-slate-500 dark:text-zinc-400 transition-colors hover:text-[#106ebe]";

function getInitials(first: string, last: string): string {
  return (
    `${(first?.charAt(0) ?? "").toUpperCase()}${(last?.charAt(0) ?? "").toUpperCase()}` ||
    "?"
  );
}

interface SidebarProps {
  /** Se llama al navegar para cerrar la sidebar en móvil */
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const user = authState.user;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [perfilOpen, setPerfilOpen] = useState(true);
  const [matchesOpen, setMatchesOpen] = useState(true);
  const [gruposOpen, setGruposOpen] = useState(true);
  const [mensajesOpen, setMensajesOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const count = await getFriendRequestCount(user.id);
      setPendingRequests(count);
      const convs = await getConversations(user.id);
      const unread = convs.filter((c: ConversationWithLastMessage) =>
        hasUnreadMessages(c, user.id),
      ).length;
      setUnreadCount(unread);
    }
    load();
    getProfile(user.id)
      .then((p) => {
        if (p) {
          setProfileData(p);
          if (p.avatar_url) setAvatarUrl(p.avatar_url);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const email = user?.email ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = getInitials(firstName, lastName);

  function nav(path: string) {
    navigate(path)
    onClose?.()
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-[#faf9f8] dark:bg-zinc-950">
      {/* User profile section */}
      <div className="flex items-start gap-3 px-4 pt-6 pb-6">
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
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 uppercase truncate leading-tight">
              {fullName}
            </p>
            {profileData?.is_premium && (
              <Crown className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 truncate">
            {email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto space-y-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Inicio */}
        <button
          type="button"
          onClick={() => nav("/feed")}
          className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
            location.pathname === "/feed"
              ? "font-semibold text-slate-900 dark:text-zinc-100"
              : "font-normal text-slate-700 dark:text-zinc-300"
          }`}
        >
          {location.pathname === "/feed" && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
          )}
          <House
            className={`h-[18px] w-[18px] ${
              location.pathname === "/feed"
                ? "text-[#106ebe]"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          />
          Inicio  
        </button>

        {/* Mi Perfil — active */}
        <div>
          <button
            type="button"
            onClick={() => {
              setPerfilOpen(!perfilOpen);
              nav(`/profile/${user?.id}`);
            }}
            className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
              location.pathname === "/profile"
                ? "font-semibold text-slate-900 dark:text-zinc-100"
                : "font-normal text-slate-700 dark:text-zinc-300"
            }`}
          >
            {location.pathname === "/profile" && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
            )}
            <User
              className={`h-[18px] w-[18px] ${
                location.pathname === "/profile"
                  ? "text-[#106ebe]"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            />
            <span className="flex-1 text-left">Mi Perfil</span>
            {perfilOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
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
            onClick={() => {
              setMatchesOpen(!matchesOpen)
              nav("/matches")
            }}
            className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
              location.pathname === "/matches"
                ? "font-semibold text-slate-900 dark:text-zinc-100"
                : "font-normal text-slate-700 dark:text-zinc-300"
            }`}
          >
            {location.pathname === "/matches" && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
            )}

            <Heart
              className={`h-[18px] w-[18px] ${
                location.pathname === "/matches"
                  ? "text-[#106ebe]"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            />

            <span className="flex-1 text-left">Mis Matches</span>

            {matchesOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            )}
          </button>

          {matchesOpen && (
            <div className="pb-1">
              {MATCHES_SUB_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={SUB_ITEM_CLASS}
                  onClick={() => {
                    if (item === "Nuevos matches") {
                      nav("/matches")
                    }
                  }}
                >
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
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-normal text-slate-700 dark:text-zinc-300 transition-colors hover:text-[#106ebe]"
          >
            <Users className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
            <span className="flex-1 text-left">Grupos de estudio</span>
            {gruposOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
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
            onClick={() => {
              setMensajesOpen(!mensajesOpen);
              nav("/messages");
            }}
            className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
              location.pathname === "/messages"
                ? "font-semibold text-slate-900 dark:text-zinc-100"
                : "font-normal text-slate-700 dark:text-zinc-300"
            }`}
          >
            {location.pathname === "/messages" && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
            )}
            <MessageSquare
              className={`h-[18px] w-[18px] ${
                location.pathname === "/messages"
                  ? "text-[#106ebe]"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            />
            <span className="flex-1 text-left">Mensajes</span>
            {mensajesOpen ? (
              <ChevronUp className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="h-[14px] w-[14px] text-slate-400 dark:text-zinc-500" />
            )}
          </button>

          {mensajesOpen && (
            <div className="pb-1">
              <button
                type="button"
                onClick={() => nav("/messages?tab=recientes")}
                className={SUB_ITEM_CLASS + " relative"}
              >
                <span className="flex items-center gap-2">
                  Chats recientes
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#487CFF] shrink-0" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => nav("/messages?tab=archivados")}
                className={SUB_ITEM_CLASS}
              >
                <span className="flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5" />
                  Archivados
                </span>
              </button>
              <button
                type="button"
                onClick={() => nav("/messages?tab=solicitudes")}
                className={SUB_ITEM_CLASS + " relative"}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Solicitudes de mensaje
                  {pendingRequests > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#487CFF] text-[10px] font-bold text-white shrink-0">
                      {pendingRequests}
                    </span>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
        {/* Premium */}
        <div>
        <button
          type="button"
          onClick={() => nav("/premium")}
          className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
            location.pathname === "/premium"
              ? "font-semibold text-slate-900 dark:text-zinc-100"
              : "font-normal text-slate-700 dark:text-zinc-300"
          }`}
        >
          {location.pathname === "/premium" && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 bg-[#106ebe]" />
          )}

          <Crown
            className={`h-[18px] w-[18px] ${
              location.pathname === "/premium"
                ? "text-yellow-500"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          />

          Premium
        </button>
        </div>

        {/* Panel de Administración — solo visible para admin */}
        {authState.user?.role === "admin" && (
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-2">
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Administración
            </p>
            <button
              type="button"
              onClick={() => nav("/admin/dashboard")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/dashboard")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <BarChart3 className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => nav("/admin/users")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/users")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <Users className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Usuarios
            </button>
            <button
              type="button"
              onClick={() => nav("/admin/reports")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/reports")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <Flag className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Reportes
            </button>
            <button
              type="button"
              onClick={() => nav("/admin/settings")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/admin/settings")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <Settings className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Configuración
            </button>
          </div>
        )}

        {/* Panel de Moderador — visible para moderator y admin */}
        {(authState.user?.role === "moderator" ||
          authState.user?.role === "admin") && (
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-2">
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Moderación
            </p>
            <button
              type="button"
              onClick={() => nav("/moderator/dashboard")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/dashboard")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <Shield className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => nav("/moderator/reports")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/reports")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <Flag className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Reportes
            </button>
            <button
              type="button"
              onClick={() => nav("/moderator/suspended")}
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-[#106ebe] ${
                location.pathname.startsWith("/moderator/suspended")
                  ? "font-semibold text-slate-900 dark:text-zinc-100"
                  : "font-normal text-slate-700 dark:text-zinc-300"
              }`}
            >
              <User className="h-[18px] w-[18px] text-slate-500 dark:text-zinc-400" />
              Suspendidas
            </button>
          </div>
        )}
      </nav>

      {/* Cerrar sesion */}
      <button
        type="button"
        onClick={() => {
          logout();
          nav("/login");
        }}
        className="flex w-full items-center gap-3 border-t border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm font-normal text-slate-500 dark:text-zinc-400 transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Cerrar sesion
      </button>
    </aside>
  );
}

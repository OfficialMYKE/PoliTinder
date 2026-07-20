import { useLocation, useNavigate } from "react-router-dom"
import { House, User, Heart, MessageSquare, Users } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { cn } from "../../lib/utils"

const NAV_ITEMS = [
  { icon: House, label: "Inicio", path: "/feed" },
  { icon: Users, label: "Grupos", path: "/groups" },
  { icon: Heart, label: "Matches", path: "/matches" },
  { icon: MessageSquare, label: "Mensajes", path: "/messages" },
  { icon: User, label: "Perfil", path: "/profile" },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state: authState } = useAuth()

  function getPath(item: (typeof NAV_ITEMS)[number]) {
    if (item.path === "/profile") {
      return `/profile/${authState.user?.id}`
    }
    return item.path
  }

  function isActive(path: string) {
    if (path === "/profile") return location.pathname.startsWith("/profile")
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(getPath(item))}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 min-w-[56px]",
                active
                  ? "text-[#487CFF]"
                  : "text-slate-400 dark:text-zinc-500 active:text-slate-600 dark:active:text-zinc-300",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all",
                  active && "drop-shadow-[0_0_6px_rgba(72,124,255,0.4)]",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={cn(
                "text-[10px] leading-tight transition-all",
                active ? "font-semibold" : "font-medium",
              )}>
                {item.label}
              </span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-[#487CFF]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

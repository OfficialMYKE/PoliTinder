import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Search, Sun, Moon, PenSquare } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { getFeedPosts } from "../services/posts"
import { PostCard } from "../components/post/PostCard"
import { StoriesBar } from "../components/post/StoriesBar"
import { RightWidgets } from "../components/common/RightWidgets"
import { CreateContentModal } from "../components/common/CreateContentModal"
import type { PostWithProfile } from "../types/post"

export default function Feed() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const user = state.user
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<"post" | "story" | null>(null)

  const loadPosts = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getFeedPosts(user.id)
      setPosts(data)
    } catch {
      console.error("Error loading feed")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  function handleContentCreated() {
    loadPosts()
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            PoliTinder
          </h1>

          <div className="relative w-1/3 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar estudiantes, grupos o proyectos..."
              className="w-full rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              className="relative p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="max-w-7xl mx-auto w-full flex gap-6 px-6 py-6">
        {/* Left column — handled by AppLayout Sidebar */}

        {/* Middle column — Feed */}
        <div className="flex-1 max-w-2xl space-y-4">
          <StoriesBar onAddStory={() => setModalMode("story")} />

          {/* Create Post trigger */}
          <button
            type="button"
            onClick={() => setModalMode("post")}
            className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#487CFF]/10 text-sm font-semibold text-[#487CFF] select-none">
                {user?.firstName?.charAt(0)?.toUpperCase() ?? "U"}
                {user?.lastName?.charAt(0)?.toUpperCase() ?? ""}
              </div>
              <span className="flex-1 text-sm text-slate-400 dark:text-zinc-500">
                ¿Qué estás pensando?
              </span>
              <PenSquare className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
            </div>
          </button>

          {/* Feed Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 dark:text-zinc-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Aún no hay publicaciones en tu feed.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                Los posts de otros estudiantes aparecerán aquí.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>

        {/* Right column — Widgets */}
        <div className="w-80 hidden xl:block">
          <div className="sticky top-24">
            <RightWidgets />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-zinc-800 py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
      </footer>

      {/* Create Content Modal */}
      {modalMode && (
        <CreateContentModal
          mode={modalMode}
          isOpen
          onClose={() => setModalMode(null)}
          onContentCreated={handleContentCreated}
        />
      )}
    </div>
  )
}

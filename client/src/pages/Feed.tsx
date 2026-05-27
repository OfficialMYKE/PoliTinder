import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getFeedPosts } from "../services/posts"
import { PostCard } from "../components/post/PostCard"
import { StoriesBar } from "../components/post/StoriesBar"
import type { PostWithProfile } from "../types/post"

export default function Feed() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const user = state.user
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            PoliTinder
          </h1>
          <button
            type="button"
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      <StoriesBar />

      <div className="flex-1 px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-500">
                Aún no hay publicaciones en tu feed.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Los posts de otros estudiantes aparecerán aquí.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

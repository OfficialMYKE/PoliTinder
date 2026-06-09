import { useState, useEffect } from "react"
import { Loader2, Send, Trash2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getPostComments, createComment } from "../../services/posts"
import type { PostComment } from "../../types/post"

interface PostCommentsProps {
  postId: string
  onCommentAdded?: () => void
  onCommentDeleted?: () => void
}

export function PostComments({ postId, onCommentAdded, onCommentDeleted }: PostCommentsProps) {
  const { state } = useAuth()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  async function loadComments() {
    try {
      const data = await getPostComments(postId)
      setComments(data)
    } catch {
      console.error("Error loading comments")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    const trimmed = newComment.trim()
    if (!trimmed || !state.user?.id || sending) return
    setSending(true)
    try {
      const comment = await createComment(postId, state.user.id, trimmed)
      setComments((prev) => [...prev, comment])
      setNewComment("")
      onCommentAdded?.()
    } catch {
      console.error("Error sending comment")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
      <div className="max-h-64 overflow-y-auto space-y-3 px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-zinc-500" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 dark:text-zinc-500 py-2">
            Sin comentarios aún. Sé el primero en comentar.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <div className="h-7 w-7 shrink-0 rounded-full bg-[#487CFF]/10 flex items-center justify-center text-xs font-semibold text-[#487CFF] overflow-hidden">
                {comment.profile?.avatar_url ? (
                  <img
                    src={comment.profile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  comment.profile?.nickname?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  {comment.profile?.nickname ?? "Usuario"}
                </p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800 px-5 py-3">
        <div className="h-7 w-7 shrink-0 rounded-full bg-[#487CFF]/10 flex items-center justify-center text-xs font-semibold text-[#487CFF] overflow-hidden">
          {state.user?.email?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-transparent text-xs text-slate-700 dark:text-zinc-300 outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!newComment.trim() || sending}
          className="shrink-0 text-[#487CFF] transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

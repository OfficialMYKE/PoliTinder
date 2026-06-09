import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Bookmark, Share2, Loader2, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { likePost, unlikePost, updatePost, deletePost } from "../../services/posts"
import { PostComments } from "./PostComments"
import type { PostWithProfile } from "../../types/post"

interface PostCardProps {
  post: PostWithProfile
  onCommentCountChange?: (postId: string, delta: number) => void
  onPostDeleted?: (postId: string) => void
  onPostUpdated?: (postId: string, content: string) => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Ayer"
  return `Hace ${days}d`
}

export function PostCard({ post, onCommentCountChange, onPostDeleted, onPostUpdated }: PostCardProps) {
  const navigate = useNavigate()
  const { state } = useAuth()
  const currentUserId = state.user?.id
  const isOwner = currentUserId === post.user_id

  const [liked, setLiked] = useState(post.liked_by_user ?? false)
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count ?? 0)
  const [liking, setLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const nickname = post.profile?.nickname ?? "Usuario"
  const avatarUrl = post.profile?.avatar_url
  const career = post.profile?.career ?? ""

  async function handleLike() {
    if (!currentUserId || liking) return
    setLiking(true)
    try {
      if (liked) {
        await unlikePost(currentUserId, post.id)
        setLiked(false)
        setLikesCount((c) => Math.max(0, c - 1))
      } else {
        await likePost(currentUserId, post.id)
        setLiked(true)
        setLikesCount((c) => c + 1)
      }
    } catch {
      console.error("Error toggling like")
    } finally {
      setLiking(false)
    }
  }

  function handleCommentAdded() {
    setCommentsCount((c) => c + 1)
    onCommentCountChange?.(post.id, 1)
  }

  function handleCommentDeleted() {
    setCommentsCount((c) => Math.max(0, c - 1))
    onCommentCountChange?.(post.id, -1)
  }

  async function handleSaveEdit() {
    const trimmed = editContent.trim()
    if (!trimmed || saving || trimmed === post.content) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await updatePost(post.id, { content: trimmed })
      onPostUpdated?.(post.id, trimmed)
      setEditing(false)
    } catch {
      console.error("Error updating post")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      await deletePost(post.id)
      onPostDeleted?.(post.id)
    } catch {
      console.error("Error deleting post")
      setDeleting(false)
    }
  }

  function cancelEdit() {
    setEditContent(post.content ?? "")
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#487CFF]/10 cursor-pointer"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nickname}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#487CFF]">
                {nickname.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => navigate(`/profile/${post.user_id}`)}
              className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate text-left hover:underline cursor-pointer"
            >
              {nickname}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
              {career && <span className="truncate">{career}</span>}
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-full p-1.5 text-slate-400 dark:text-zinc-500 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1">
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); setEditing(true); setEditContent(post.content ?? "") }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-zinc-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); handleDelete() }}
                      disabled={deleting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {deleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-3 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border border-slate-200 dark:border-zinc-700 px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || saving}
                className="flex items-center gap-1 rounded-full bg-[#487CFF] px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.content && (
              <p className="mt-3 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}

            {post.image_url && (
              <div className="mt-3 -mx-5">
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full bg-[#487CFF]/10 px-2.5 py-1 text-xs font-medium text-[#487CFF]"
                  >
                    @{tag.nickname}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 px-5 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {liking ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-zinc-500" />
            ) : (
              <Heart
                className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-slate-500 dark:text-zinc-400"}`}
              />
            )}
            <span className={liked ? "text-red-500 font-medium" : "text-slate-500 dark:text-zinc-400"}>
              {likesCount}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-[#487CFF] text-[#487CFF]" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText?.(`${window.location.origin}/post/${post.id}`)
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {showComments && (
        <PostComments
          postId={post.id}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </motion.div>
  )
}

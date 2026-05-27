import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Bookmark, Share2, Loader2 } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { likePost, unlikePost } from "../../services/posts"
import { PostComments } from "./PostComments"
import type { PostWithProfile } from "../../types/post"

interface PostCardProps {
  post: PostWithProfile
  onCommentCountChange?: (postId: string, delta: number) => void
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

export function PostCard({ post, onCommentCountChange }: PostCardProps) {
  const { state } = useAuth()
  const currentUserId = state.user?.id

  const [liked, setLiked] = useState(post.liked_by_user ?? false)
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count ?? 0)
  const [liking, setLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [saved, setSaved] = useState(false)

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#487CFF]/10">
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
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {nickname}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {career && <span className="truncate">{career}</span>}
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        {post.content && (
          <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
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
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-slate-100"
          >
            {liking ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <Heart
                className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-slate-500"}`}
              />
            )}
            <span className={liked ? "text-red-500 font-medium" : "text-slate-500"}>
              {likesCount}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-[#487CFF] text-[#487CFF]" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText?.(`${window.location.origin}/post/${post.id}`)
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100"
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

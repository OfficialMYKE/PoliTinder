import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import {
  X, Check, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Loader2,
  Trash2, MoreHorizontal, Download, MicOff, Flag, Heart, Send, Share2, AlertCircle,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import {
  deleteStory, likeStory, unlikeStory, hasUserLikedStory,
  replyToStory, muteUser, unmuteUser, isUserMuted, shareStory, reportStory,
} from "../../services/stories"
import type { StoryWithProfile } from "../../types/story"

interface StoryViewerProps {
  stories: StoryWithProfile[]
  startIndex?: number
  onClose: () => void
  onStoriesChanged?: () => void
}

const IMAGE_DURATION = 5000
const LONG_PRESS_MS = 300
const TICK_MS = 50

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${Math.floor(hours / 24)}d`
}

export function StoryViewer({ stories, startIndex = 0, onClose, onStoriesChanged }: StoryViewerProps) {
  const { state } = useAuth()
  const currentUserId = state.user?.id

  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [mediaReady, setMediaReady] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [mutedUser, setMutedUser] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const [replySent, setReplySent] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [sendingReport, setSendingReport] = useState(false)
  const [reportError, setReportError] = useState("")

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)
  const isSwiping = useRef(false)
  const pressStartRef = useRef(0)
  const wasLongPress = useRef(false)
  const navigateRef = useRef<(delta: 1 | -1) => void>(() => {})
  const menuRef = useRef<HTMLDivElement>(null)
  const elapsedRef = useRef(0)

  const currentStory = stories[currentIndex]
  const profile = currentStory?.profile
  const isOwner = currentUserId === currentStory?.user_id
  const nickname = profile?.nickname ?? "Usuario"

  const currentUserStories = useMemo(() => {
    if (!currentStory) return []
    return stories.filter((s) => s.user_id === currentStory.user_id)
  }, [stories, currentStory])

  const userStoryIndex = currentUserStories.findIndex((s) => s.id === currentStory?.id)
  const totalUserStories = currentUserStories.length

  function navigate(delta: 1 | -1) {
    const next = currentIndex + delta
    if (next < 0 || next >= stories.length) {
      if (delta > 0) onClose()
      return
    }
    setCurrentIndex(next)
    elapsedRef.current = 0
    setProgress(0)
    setMediaReady(false)
    setPaused(false)
  }

  navigateRef.current = navigate

  useEffect(() => {
    if (!currentStory || currentStory.type === "video") return
    if (paused || !mediaReady) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      elapsedRef.current += TICK_MS
      const pct = Math.min((elapsedRef.current / IMAGE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) navigateRef.current(1)
    }, TICK_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, mediaReady, currentStory])

  useEffect(() => {
    if (!currentStory || !currentUserId) return
    hasUserLikedStory(currentUserId, currentStory.id).then(setLiked)
    if (!isOwner) {
      isUserMuted(currentUserId, currentStory.user_id).then(setMutedUser)
    }
  }, [currentStory?.id, currentUserId, currentStory?.user_id, isOwner])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"
      if (isInput) return
      if (e.key === "ArrowLeft") navigate(-1)
      else if (e.key === "ArrowRight") navigate(1)
      else if (e.key === "Escape") onClose()
      else if (e.key === " ") { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  })

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  function handleMediaClick(e: React.MouseEvent<HTMLDivElement>) {
    if (isSwiping.current) { isSwiping.current = false; return }
    if (wasLongPress.current) { wasLongPress.current = false; return }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width * 0.3) {
      navigate(-1)
    } else {
      navigate(1)
    }
  }

  function handlePointerDown() {
    wasLongPress.current = false
    pressStartRef.current = Date.now()
    setPaused(true)
  }

  function handlePointerUp() {
    const elapsed = Date.now() - pressStartRef.current
    if (elapsed >= LONG_PRESS_MS) {
      wasLongPress.current = true
    }
    setPaused(false)
  }

  function handleTouchStart(e: React.TouchEvent) {
    isSwiping.current = false
    wasLongPress.current = false
    touchStartX.current = e.touches[0].clientX
    pressStartRef.current = Date.now()
    setPaused(true)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    const elapsed = Date.now() - pressStartRef.current
    setPaused(false)
    if (elapsed >= LONG_PRESS_MS) {
      wasLongPress.current = true
      return
    }
    if (Math.abs(diff) > 50) {
      isSwiping.current = true
      if (diff > 0) { navigate(-1) } else { navigate(1) }
    }
  }

  function handleVideoTime(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget
    if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100)
  }

  function handleVideoEnd() {
    navigate(1)
  }

  async function handleDelete() {
    if (!currentStory || deleting) return
    setDeleting(true)
    setMenuOpen(false)
    try {
      await deleteStory(currentStory.id)
      onStoriesChanged?.()
      if (stories.length <= 1) { onClose(); return }
      navigate(1)
    } catch {
      console.error("Error deleting story")
    } finally {
      setDeleting(false)
    }
  }

  function handleSave() {
    setMenuOpen(false)
    const a = document.createElement("a")
    a.href = currentStory!.media_url
    a.download = `story-${currentStory!.id}`
    a.click()
  }

  async function handleLike() {
    if (!currentStory || !currentUserId) return
    if (liked) {
      const ok = await unlikeStory(currentUserId, currentStory.id)
      if (ok) setLiked(false)
    } else {
      const ok = await likeStory(currentUserId, currentStory.id)
      if (ok) setLiked(true)
    }
  }

  async function handleReply() {
    if (!currentStory || !currentUserId || !replyText.trim() || sendingReply) return
    setSendingReply(true)
    const ok = await replyToStory(currentStory.id, currentUserId, replyText.trim(), currentStory.user_id)
    setSendingReply(false)
    if (ok) {
      setReplyText("")
      setReplySent(true)
      setTimeout(() => setReplySent(false), 2000)
    }
  }

  function handleReplyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleReply()
    }
  }

  async function handleShare() {
    if (!currentStory) return
    await shareStory(currentStory)
  }

  async function handleMuteUser() {
    setMenuOpen(false)
    if (!currentUserId || !currentStory) return
    if (mutedUser) {
      const ok = await unmuteUser(currentUserId, currentStory.user_id)
      if (ok) setMutedUser(false)
    } else {
      const ok = await muteUser(currentUserId, currentStory.user_id)
      if (ok) setMutedUser(true)
    }
  }

  function handleReport() {
    setMenuOpen(false)
    setReportReason("")
    setReportDescription("")
    setReportError("")
    setShowReportDialog(true)
    setPaused(true)
  }

  async function handleSubmitReport() {
    if (!currentStory || !currentUserId) return
    if (reportReason.trim().length < 10) {
      setReportError("La razón debe tener al menos 10 caracteres")
      return
    }
    setSendingReport(true)
    setReportError("")
    const ok = await reportStory(
      currentUserId,
      currentStory.user_id,
      reportReason.trim(),
      reportDescription.trim() || undefined,
    )
    setSendingReport(false)
    if (!ok) {
      setReportError("Error al enviar el reporte. Intenta de nuevo.")
      return
    }
    setShowReportDialog(false)
  }

  function handleInputFocus() {
    setPaused(true)
  }

  if (!currentStory) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] w-full h-[100dvh] bg-black overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-1 px-2 mb-3">
            {Array.from({ length: totalUserStories }).map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                  style={{
                    width: i < userStoryIndex ? "100%" : i === userStoryIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {nickname.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-white text-sm font-medium block truncate">{nickname}</span>
                <span className="text-white/60 text-xs">{formatTime(currentStory.created_at)}</span>
                {currentStory.description && (
                  <span className="text-white/80 text-xs mt-0.5 line-clamp-1 block">{currentStory.description}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentStory.type === "video" && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}

              {/* Three dots menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p) }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[190px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1">
                    {isOwner ? (
                      <>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Eliminar historia
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Guardar en dispositivo
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleMuteUser}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          <MicOff className="h-4 w-4" />
                          {mutedUser ? `Dejar de silenciar a ${nickname}` : `Silenciar a ${nickname}`}
                        </button>
                        <button
                          type="button"
                          onClick={handleReport}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Flag className="h-4 w-4" />
                          Reportar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose() }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {currentStory.tags && currentStory.tags.length > 0 && (
          <div className="absolute top-28 left-0 right-0 z-20 flex flex-wrap gap-1.5 px-4 pointer-events-none">
            {currentStory.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white"
              >
                @{tag.nickname}
              </span>
            ))}
          </div>
        )}

        {/* Media container */}
        <div
          className="flex-1 relative select-none overflow-hidden"
          onClick={handleMediaClick}
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentStory.type === "video" ? (
            <video
              ref={videoRef}
              key={currentStory.id}
              src={currentStory.media_url}
              className={`w-full h-full object-contain ${mediaReady ? "opacity-100" : "opacity-0"}`}
              autoPlay
              playsInline
              muted={muted}
              onCanPlay={() => setMediaReady(true)}
              onTimeUpdate={handleVideoTime}
              onEnded={handleVideoEnd}
            />
          ) : (
            <>
              {!mediaReady && (
                <Loader2 className="w-8 h-8 text-white animate-spin absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              <img
                key={currentStory.id}
                src={currentStory.media_url}
                alt=""
                className={`w-full h-full object-contain ${mediaReady ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setMediaReady(true)}
                draggable={false}
              />
            </>
          )}

          {/* Pause overlay */}
          {paused && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="rounded-full bg-black/40 p-4">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Desktop arrows */}
        <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between pointer-events-none px-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(-1) }}
            disabled={currentIndex === 0}
            className="pointer-events-auto p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors z-40"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(1) }}
            disabled={currentIndex === stories.length - 1}
            className="pointer-events-auto p-2 text-white/60 hover:text-white transition-colors z-40"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Bottom interaction bar (oculta para el dueño de la story) */}
        {!isOwner && (
          <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {replySent ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="rounded-full bg-green-500/20 border border-green-500/40 px-4 py-2 text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Respuesta enviada
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Responder a ${nickname}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  onFocus={handleInputFocus}
                  className="flex-1 rounded-full bg-white/20 border border-white/30 px-4 py-2 text-sm text-white placeholder-white/70 outline-none focus:bg-white/30 focus:border-white/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? "text-red-400 fill-red-400" : "text-white/80"}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report dialog */}
      {showReportDialog && (
        <div className="absolute inset-0 z-[60] bg-black/70 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-1">Reportar historia</h3>
            <p className="text-zinc-400 text-sm mb-4">
              ¿Por qué reportas esta historia de {nickname}?
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Razón (mín. 10 caracteres)"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#487CFF] resize-none mb-2"
            />
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Descripción adicional (opcional)"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#487CFF] resize-none mb-3"
            />
            {reportError && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowReportDialog(false); setPaused(false) }}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={sendingReport}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                {sendingReport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Enviar reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
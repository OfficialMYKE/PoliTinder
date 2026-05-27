import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Loader2 } from "lucide-react"
import type { StoryWithProfile } from "../../types/story"

interface StoryViewerProps {
  userId: string
  stories: StoryWithProfile[]
  onClose: () => void
}

const IMAGE_DURATION = 5000

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${Math.floor(hours / 24)}d`
}

export function StoryViewer({ userId, stories, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [direction, setDirection] = useState(0)
  const [mediaReady, setMediaReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentStory = stories[currentIndex]
  const profile = currentStory?.profile

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setDirection(1)
      setCurrentIndex((i) => i + 1)
      setProgress(0)
      setMediaReady(false)
    } else {
      onClose()
    }
  }, [currentIndex, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((i) => i - 1)
      setProgress(0)
      setMediaReady(false)
    }
  }, [currentIndex])

  useEffect(() => {
    if (currentStory?.type === "video") return

    if (paused || !mediaReady) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / IMAGE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) goNext()
    }, 50)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, mediaReady, currentIndex, currentStory?.type, goNext])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
      else if (e.key === "Escape") onClose()
      else if (e.key === " ") { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev, onClose])

  function handleVideoTime(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget
    if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100)
  }

  function handleVideoEnd() {
    goNext()
  }

  if (!currentStory) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="relative w-full h-full max-w-lg mx-auto flex flex-col"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className="absolute top-0 left-0 right-0 z-10 pt-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex gap-1 px-2 mb-3">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {profile?.nickname?.charAt(0) ?? "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">{profile?.nickname ?? ""}</span>
                <span className="text-white/60 text-xs">{formatTime(currentStory.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {paused && (
                <Pause className="w-4 h-4 text-white/80" />
              )}
              {currentStory.type === "video" && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
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

        <div className="flex-1 flex items-center justify-center relative select-none">
          {!mediaReady && (
            <Loader2 className="w-8 h-8 text-white animate-spin absolute z-10" />
          )}
          {currentStory.type === "video" ? (
            <video
              ref={videoRef}
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
            <img
              src={currentStory.media_url}
              alt=""
              className={`w-full h-full object-contain ${mediaReady ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setMediaReady(true)}
            />
          )}
        </div>

        <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between pointer-events-none px-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            disabled={currentIndex === 0}
            className="pointer-events-auto p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="pointer-events-auto p-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

import { useState, useEffect, useRef, useMemo } from "react"
import { Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { getActiveStories } from "../../services/stories"
import { StoryViewer } from "./StoryViewer"
import type { StoryWithProfile } from "../../types/story"

interface StoriesBarProps {
  onAddStory?: () => void
}

export function StoriesBar({ onAddStory }: StoriesBarProps) {
  const [stories, setStories] = useState<StoryWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStories()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function checkScroll() {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    return () => el.removeEventListener("scroll", checkScroll)
  }, [stories])

  async function loadStories() {
    try {
      const data = await getActiveStories()
      setStories(data)
    } catch {
      console.error("Error loading stories")
    } finally {
      setLoading(false)
    }
  }

  function scroll(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" })
  }

  const grouped = useMemo(() => {
    const map = new Map<string, StoryWithProfile[]>()
    for (const story of stories) {
      const existing = map.get(story.user_id) ?? []
      existing.push(story)
      map.set(story.user_id, existing)
    }
    return map
  }, [stories])

  const allStories = useMemo(() => {
    const result: StoryWithProfile[] = []
    const userOrder = Array.from(grouped.keys())
    for (const userId of userOrder) {
      const userStories = grouped.get(userId)!
      for (const story of userStories) {
        result.push(story)
      }
    }
    return result
  }, [grouped])

  function openStoryViewer(userId: string) {
    const idx = allStories.findIndex((s) => s.user_id === userId)
    if (idx !== -1) {
      setStartIndex(idx)
      setStoryViewerOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
              <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
              <div className="h-2 w-12 rounded bg-slate-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative group/stories">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll(-180)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 hidden group-hover/stories:flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll(180)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 hidden group-hover/stories:flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:scale-105 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-3 px-6 py-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={onAddStory}
            className="flex flex-col items-center gap-1.5 shrink-0 group/add"
          >
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center transition-all group-hover/add:border-[#487CFF] group-hover/add:scale-105">
              <Plus className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-hover/add:text-[#487CFF] transition-colors" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Tu historia</span>
          </button>

          {Array.from(grouped.entries()).map(([userId, userStories]) => {
            const profile = userStories[0].profile
            return (
              <button
                key={userId}
                type="button"
                onClick={() => openStoryViewer(userId)}
                className="flex flex-col items-center gap-1.5 shrink-0 group/story"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#487CFF] to-purple-400 p-0.5 transition-transform group-hover/story:scale-105">
                  <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 p-0.5">
                    <div className="h-full w-full rounded-full overflow-hidden bg-[#487CFF]/10">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#487CFF]">
                          {profile?.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[64px]">
                  {profile?.nickname ?? ""}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {storyViewerOpen && (
        <StoryViewer
          stories={allStories}
          startIndex={startIndex}
          onClose={() => setStoryViewerOpen(false)}
          onStoriesChanged={loadStories}
        />
      )}
    </>
  )
}

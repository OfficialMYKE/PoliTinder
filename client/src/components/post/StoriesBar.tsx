import { useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { getActiveStories, createStory, getUserStories } from "../../services/stories"
import { uploadStoryMedia } from "../../services/supabase"
import { StoryViewer } from "./StoryViewer"
import type { StoryWithProfile } from "../../types/story"

export function StoriesBar() {
  const { state } = useAuth()
  const [stories, setStories] = useState<StoryWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserStories, setSelectedUserStories] = useState<StoryWithProfile | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadStories()
  }, [])

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

  async function handleAddStory(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !state.user?.id) return
    setUploading(true)
    try {
      const mediaUrl = await uploadStoryMedia(state.user.id, file)
      const type = file.type.startsWith("video/") ? "video" : "image"
      await createStory(state.user.id, mediaUrl, type)
      await loadStories()
    } catch {
      console.error("Error uploading story")
    } finally {
      setUploading(false)
    }
  }

  function groupByUser(): Map<string, StoryWithProfile[]> {
    const grouped = new Map<string, StoryWithProfile[]>()
    for (const story of stories) {
      const existing = grouped.get(story.user_id) ?? []
      existing.push(story)
      grouped.set(story.user_id, existing)
    }
    return grouped
  }

  const grouped = groupByUser()

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 overflow-x-auto">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400 shrink-0" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <label className="relative flex flex-col items-center gap-1.5 cursor-pointer shrink-0">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center transition-colors hover:border-[#487CFF]">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : (
              <Plus className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <span className="text-[10px] text-slate-500">Tu historia</span>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleAddStory}
            disabled={uploading}
          />
        </label>

        {Array.from(grouped.entries()).map(([userId, userStories]) => {
          const profile = userStories[0].profile
          const firstStory = userStories[0]
          return (
            <button
              key={userId}
              type="button"
              onClick={() => setSelectedUserStories(firstStory)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#487CFF] to-purple-400 p-0.5">
                <div className="h-full w-full rounded-full bg-white p-0.5">
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
              <span className="text-[10px] text-slate-500 truncate max-w-[64px]">
                {profile?.nickname ?? ""}
              </span>
            </button>
          )
        })}
      </div>

      {selectedUserStories && (
        <StoryViewer
          userId={selectedUserStories.user_id}
          stories={grouped.get(selectedUserStories.user_id) ?? []}
          onClose={() => setSelectedUserStories(null)}
        />
      )}
    </>
  )
}

import { supabase, resolveTags } from "./supabase"
import { getOrCreateConversation, sendMessage } from "./messages"
import type { Story, StoryWithProfile, StoryReplyWithProfile } from "../types/story"
import type { TaggedUser } from "../types/post"

export async function createStory(
  userId: string,
  mediaUrl: string,
  type: "image" | "video",
  description?: string,
  tags?: string[],
): Promise<Story | null> {
  const baseData: Record<string, unknown> = { user_id: userId, media_url: mediaUrl, type }
  if (description) baseData.description = description
  if (tags && tags.length > 0) baseData.tags = tags

  const insertData = { ...baseData }
  const { data, error } = await supabase
    .from("stories")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("Error creating story:", error)
    if (
      (description || (tags && tags.length > 0)) &&
      error.message?.includes("column")
    ) {
      delete baseData.description
      delete baseData.tags
      const { data: fallback, error: fallbackError } = await supabase
        .from("stories")
        .insert(baseData)
        .select()
        .single()
      if (fallbackError) {
        console.error("Error creating story (fallback):", fallbackError)
        return null
      }
      return fallback as Story
    }
    return null
  }

  return data as Story
}

export async function getStoryTags(storyId: string): Promise<TaggedUser[]> {
  try {
    const { data, error } = await supabase
      .rpc("get_story_tags", { story_id_param: storyId })
    if (error) return []
    return (data ?? []) as TaggedUser[]
  } catch {
    return []
  }
}

export async function getUserStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", userId)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user stories:", error)
    return []
  }

  const stories = (data ?? []) as Story[]
  for (const story of stories) {
    const rawTags = (story as unknown as { tags?: string[] }).tags
    if (rawTags && rawTags.length > 0) {
      story.tags = await resolveTags(rawTags)
    }
  }
  return stories
}

export async function getActiveStories(): Promise<StoryWithProfile[]> {
  const { data, error } = await supabase
    .from("stories")
    .select(`
      *,
      profile:profiles!user_id(nickname, avatar_url)
    `)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active stories:", error)
    return []
  }

  const stories = (data ?? []) as unknown as StoryWithProfile[]
  for (const story of stories) {
    const rawTags = (story as unknown as { tags?: string[] }).tags
    if (rawTags && rawTags.length > 0) {
      story.tags = await resolveTags(rawTags)
    }
  }
  return stories
}

export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)

  if (error) {
    console.error("Error deleting story:", error)
    throw new Error(error.message)
  }
}

// ── Story Likes ──

export async function likeStory(userId: string, storyId: string): Promise<boolean> {
  const { error } = await supabase
    .from("story_likes")
    .insert({ user_id: userId, story_id: storyId })
  if (error) {
    console.error("Error liking story:", error)
    return false
  }
  return true
}

export async function unlikeStory(userId: string, storyId: string): Promise<boolean> {
  const { error } = await supabase
    .from("story_likes")
    .delete()
    .eq("user_id", userId)
    .eq("story_id", storyId)
  if (error) {
    console.error("Error unliking story:", error)
    return false
  }
  return true
}

export async function hasUserLikedStory(userId: string, storyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("story_likes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("story_id", storyId)
    .maybeSingle()
  if (error) return false
  return !!data
}

export async function getStoryLikeCount(storyId: string): Promise<number> {
  const { count, error } = await supabase
    .from("story_likes")
    .select("*", { count: "exact", head: true })
    .eq("story_id", storyId)
  if (error) return 0
  return count ?? 0
}

// ── Story Replies ──

export async function replyToStory(
  storyId: string,
  userId: string,
  content: string,
  storyOwnerId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("story_replies")
    .insert({ story_id: storyId, user_id: userId, content })
  if (error) {
    console.error("Error replying to story:", error)
    return false
  }

  // También enviar un mensaje directo al dueño de la story
  try {
    const conversationId = await getOrCreateConversation(userId, storyOwnerId)
    if (conversationId) {
      await sendMessage(conversationId, userId, content, storyId)
    }
  } catch (e) {
    console.error("Error sending DM for story reply:", e)
  }

  return true
}

export async function getStoryReplies(storyId: string): Promise<StoryReplyWithProfile[]> {
  const { data, error } = await supabase
    .from("story_replies_with_profiles")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching story replies:", error)
    return []
  }
  return (data ?? []) as StoryReplyWithProfile[]
}

// ── User Mutes ──

export async function muteUser(userId: string, mutedUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from("user_mutes")
    .insert({ user_id: userId, muted_user_id: mutedUserId })
  if (error) {
    console.error("Error muting user:", error)
    return false
  }
  return true
}

export async function unmuteUser(userId: string, mutedUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from("user_mutes")
    .delete()
    .eq("user_id", userId)
    .eq("muted_user_id", mutedUserId)
  if (error) {
    console.error("Error unmuting user:", error)
    return false
  }
  return true
}

export async function isUserMuted(userId: string, mutedUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_mutes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("muted_user_id", mutedUserId)
    .maybeSingle()
  if (error) return false
  return !!data
}

// ── Report ──

export async function reportStory(
  reporterId: string,
  reportedId: string,
  reason: string,
  description?: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      description: description ?? null,
    })
  if (error) {
    console.error("Error reporting story:", error)
    return false
  }
  return true
}

// ── Share ──

export async function shareStory(story: StoryWithProfile): Promise<boolean> {
  if (!navigator.share) return false
  try {
    await navigator.share({
      title: `Historia de ${story.profile?.nickname ?? "Usuario"}`,
      text: story.description ?? "Mira esta historia en PoliTinder",
      url: story.media_url,
    })
    return true
  } catch {
    return false
  }
}

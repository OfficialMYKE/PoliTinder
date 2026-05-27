import { supabase } from "./supabase"
import type { Story, StoryWithProfile } from "../types/story"

export async function createStory(
  userId: string,
  mediaUrl: string,
  type: "image" | "video",
): Promise<Story | null> {
  const { data, error } = await supabase
    .from("stories")
    .insert({ user_id: userId, media_url: mediaUrl, type })
    .select()
    .single()

  if (error) {
    console.error("Error creating story:", error)
    return null
  }

  return data as Story
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

  return (data as Story[]) ?? []
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

  return (data ?? []) as unknown as StoryWithProfile[]
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

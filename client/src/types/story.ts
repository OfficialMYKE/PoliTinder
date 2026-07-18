import type { TaggedUser } from "./post"

export interface Story {
  id: string
  user_id: string
  media_url: string
  type: "image" | "video"
  description?: string
  created_at: string
  expires_at: string
  tags?: TaggedUser[]
}

export interface StoryWithProfile extends Story {
  profile?: {
    nickname: string
    avatar_url: string | null
  }
}

export interface StoryReply {
  id: string
  story_id: string
  user_id: string
  content: string
  created_at: string
}

export interface StoryReplyWithProfile extends StoryReply {
  author_nickname: string
  author_avatar: string | null
}

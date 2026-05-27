export interface Story {
  id: string
  user_id: string
  media_url: string
  type: "image" | "video"
  created_at: string
  expires_at: string
}

export interface StoryWithProfile extends Story {
  profile?: {
    nickname: string
    avatar_url: string | null
  }
}

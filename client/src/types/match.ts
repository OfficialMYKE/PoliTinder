export interface UserReaction {
  id: string
  user_id: string
  target_user_id: string
  reaction: "like" | "dislike"
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
}
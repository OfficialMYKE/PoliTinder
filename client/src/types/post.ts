export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  likes_count?: number
  comments_count?: number
}

export interface PostCreateData {
  user_id: string
  content: string
  image_url?: string | null
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profile?: {
    nickname: string
    avatar_url: string | null
  }
}

export interface PostWithProfile extends Post {
  profile?: {
    nickname: string
    avatar_url: string | null
    career: string
  }
  liked_by_user?: boolean
}

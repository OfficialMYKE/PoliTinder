import type { UserRole } from "./auth"

export interface ProfileData {
  id: string
  nickname: string
  avatar_url: string | null
  banner_url: string | null
  role: UserRole
  faculty: string
  career: string
  semester: number | null
  looking_for: string[]
  bio: string
  study_styles: string[]
  interests: string[]
  last_seen_at: string | null
  is_premium: boolean
  premium_plan: string | null
  premium_since: string | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  nickname?: string
  avatar_url?: string | null
  banner_url?: string | null
  faculty?: string
  career?: string
  semester?: number | null
  looking_for?: string[]
  bio?: string
  study_styles?: string[]
  interests?: string[]
}

import { supabase } from "./supabase"
import type { ProfileData, ProfileUpdateData } from "../types/profile"

export async function createProfile(profile: ProfileData): Promise<void> {
  const { banner_url: _banner, ...dbProfile } = profile
  const { error } = await supabase
    .from("profiles")
    .upsert(dbProfile, { onConflict: "id" })

  if (error) {
    const msg = typeof error.message === "string" ? error.message : JSON.stringify(error)
    console.error("Error creating profile:", msg)
    throw new Error(msg)
  }
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching profile:", error)
    throw new Error(error.message)
  }

  return {
    id: data.id,
    nickname: data.nickname,
    avatar_url: data.avatar_url ?? null,
    banner_url: data.banner_url ?? null,
    role: data.role ?? "student",
    faculty: data.faculty,
    career: data.career,
    semester: data.semester ?? null,
    looking_for: data.looking_for ?? [],
    bio: data.bio ?? "",
    study_styles: data.study_styles ?? [],
    interests: data.interests ?? [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdateData,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error(error.message)
  }
}

export async function getPotentialMatches(
  faculty: string,
  career: string,
  excludeUserId: string,
): Promise<ProfileData[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", excludeUserId)
    .or(`faculty.eq.${faculty},career.eq.${career}`)
    .limit(20)

  if (error) {
    console.error("Error fetching potential matches:", error)
    throw new Error(error.message)
  }

  return (data as ProfileData[]) ?? []
}

export function mapOnboardingToProfile(
  userId: string,
  formData: {
    nickname: string
    avatar: string | null
    dateOfBirth: string
    faculty: string
    career: string
    semester: string | null
    lookingFor: string[]
    bio: string
    studyStyles: string[]
    interests: string[]
  },
): ProfileData {
  const semesterNum = formData.semester
    ? formData.semester === "nivelacion" ? null : Number(formData.semester)
    : null

  return {
    id: userId,
    nickname: formData.nickname,
    avatar_url: formData.avatar,
    banner_url: null,
    role: "student",
    faculty: formData.faculty,
    career: formData.career,
    semester: semesterNum,
    looking_for: formData.lookingFor,
    bio: formData.bio,
    study_styles: formData.studyStyles,
    interests: formData.interests,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

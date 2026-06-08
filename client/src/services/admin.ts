import { supabase } from "./supabase"
import type { ProfileData } from "../types/profile"

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  pendingReports: number
  studentsCount: number
  moderatorsCount: number
  adminsCount: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })

  const { count: studentsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: moderatorsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "moderator")

  const { count: adminsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")

  return {
    totalUsers: totalUsers ?? 0,
    totalPosts: totalPosts ?? 0,
    pendingReports: 0,
    studentsCount: studentsCount ?? 0,
    moderatorsCount: moderatorsCount ?? 0,
    adminsCount: adminsCount ?? 0,
  }
}

export async function getAllProfiles(): Promise<ProfileData[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching profiles:", error)
    throw new Error(error.message)
  }

  return (data as ProfileData[]) ?? []
}

export async function updateUserRole(
  userId: string,
  newRole: "student" | "moderator" | "admin",
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Error updating role:", error)
    throw new Error(error.message)
  }
}

export async function suspendUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role: "student", updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Error suspending user:", error)
    throw new Error(error.message)
  }
}

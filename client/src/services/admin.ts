import { supabase } from "./supabase"
import type { ProfileData } from "../types/profile"
import type { UserRole } from "../types/auth"

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalLikes: number
  pendingReports: number
  totalReports: number
  studentsCount: number
  moderatorsCount: number
  adminsCount: number
  activeStories: number
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  description: string | null
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  reporter_nickname?: string
  reporter_avatar?: string
  reported_nickname?: string
  reported_avatar?: string
}

export interface SystemSetting {
  key: string
  value: string
  description: string
  updated_at: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase
    .from("system_stats")
    .select("*")
    .single()

  if (error || !data) {
    const [users, posts, comments, likes, students, mods, admins, pending] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("post_comments").select("*", { count: "exact", head: true }),
      supabase.from("post_likes").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "moderator"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

    return {
      totalUsers: users.count ?? 0,
      totalPosts: posts.count ?? 0,
      totalComments: comments.count ?? 0,
      totalLikes: likes.count ?? 0,
      pendingReports: pending.count ?? 0,
      totalReports: 0,
      studentsCount: students.count ?? 0,
      moderatorsCount: mods.count ?? 0,
      adminsCount: admins.count ?? 0,
      activeStories: 0,
    }
  }

  return {
    totalUsers: data.total_users ?? 0,
    totalPosts: data.total_posts ?? 0,
    totalComments: data.total_comments ?? 0,
    totalLikes: data.total_likes ?? 0,
    pendingReports: data.pending_reports ?? 0,
    totalReports: data.total_reports ?? 0,
    studentsCount: data.students_count ?? 0,
    moderatorsCount: data.moderators_count ?? 0,
    adminsCount: data.admins_count ?? 0,
    activeStories: data.active_stories ?? 0,
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
  newRole: UserRole,
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

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports_with_profiles")
    .select("*")

  if (error) {
    console.error("Error fetching reports:", error)
    throw new Error(error.message)
  }

  return (data as Report[]) ?? []
}

export async function updateReportStatus(
  reportId: string,
  status: Report["status"],
  resolvedBy: string,
): Promise<void> {
  const update: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "resolved" || status === "dismissed") {
    update.resolved_at = new Date().toISOString()
    update.resolved_by = resolvedBy
  }

  const { error } = await supabase
    .from("reports")
    .update(update)
    .eq("id", reportId)

  if (error) {
    console.error("Error updating report:", error)
    throw new Error(error.message)
  }
}

export async function getSystemSettings(): Promise<SystemSetting[]> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("key")

  if (error) {
    console.error("Error fetching settings:", error)
    throw new Error(error.message)
  }

  return (data as SystemSetting[]) ?? []
}

export async function updateSystemSetting(
  key: string,
  value: string,
  updatedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from("system_settings")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })

  if (error) {
    console.error("Error updating setting:", error)
    throw new Error(error.message)
  }
}

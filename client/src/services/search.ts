import { supabase } from "./supabase"

export interface SearchResult {
  type: "user" | "group"
  id: string
  name: string
  subtitle: string
  avatar_url: string | null
}

export async function search(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const q = query.trim()
  const results: SearchResult[] = []

  // Search users
  const { data: users } = await supabase
    .from("profiles")
    .select("id, nickname, career, avatar_url")
    .or(`nickname.ilike.%${q}%,career.ilike.%${q}%`)
    .limit(5)

  if (users) {
    results.push(
      ...users.map((u) => ({
        type: "user" as const,
        id: u.id,
        name: u.nickname ?? "Usuario",
        subtitle: u.career ?? "",
        avatar_url: u.avatar_url,
      }))
    )
  }

  // Search groups
  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, faculty, avatar_url")
    .or(`name.ilike.%${q}%,faculty.ilike.%${q}%`)
    .limit(5)

  if (groups) {
    results.push(
      ...groups.map((g) => ({
        type: "group" as const,
        id: g.id,
        name: g.name,
        subtitle: g.faculty ?? "",
        avatar_url: g.avatar_url,
      }))
    )
  }

  return results
}

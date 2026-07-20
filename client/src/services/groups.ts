import { supabase } from "./supabase"

export interface Group {
  id: string
  name: string
  description: string
  faculty: string
  career: string
  creator_id: string
  avatar_url: string | null
  cover_url: string | null
  member_count: number
  created_at: string
  updated_at: string
  creator_nickname?: string
  creator_avatar?: string | null
  is_member?: boolean
  user_role?: string | null
}

export interface GroupMessage {
  id: string
  group_id: string
  sender_id: string
  content: string
  created_at: string
  sender_nickname?: string
  sender_avatar?: string | null
}

export interface CreateGroupData {
  name: string
  description: string
  faculty: string
  career: string
  creator_id: string
  avatar_url?: string | null
  cover_url?: string | null
}

// ── Groups CRUD ──

export async function createGroup(data: CreateGroupData): Promise<Group | null> {
  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description,
      faculty: data.faculty,
      career: data.career,
      creator_id: data.creator_id,
      avatar_url: data.avatar_url ?? null,
      cover_url: data.cover_url ?? null,
      member_count: 1,
    })
    .select()
    .single()

  if (error || !group) return null

  // Add creator as admin member
  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: data.creator_id,
    role: "admin",
  })

  return group
}

export async function getGroups(filters?: {
  faculty?: string
  career?: string
  search?: string
  userId?: string
}): Promise<Group[]> {
  let query = supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false })

  if (filters?.faculty) {
    query = query.eq("faculty", filters.faculty)
  }
  if (filters?.career) {
    query = query.eq("career", filters.career)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data: groups, error } = await query
  if (error || !groups) return []

  // Get creator profiles
  const creatorIds = [...new Set(groups.map((g) => g.creator_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .in("id", creatorIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  // Check membership for current user
  let membershipMap = new Map<string, string>()
  if (filters?.userId) {
    const groupIds = groups.map((g) => g.id)
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role")
      .eq("user_id", filters.userId)
      .in("group_id", groupIds)

    membershipMap = new Map((memberships ?? []).map((m) => [m.group_id, m.role]))
  }

  return groups.map((g) => {
    const creator = profileMap.get(g.creator_id)
    return {
      ...g,
      creator_nickname: creator?.nickname ?? null,
      creator_avatar: creator?.avatar_url ?? null,
      is_member: membershipMap.has(g.id),
      user_role: membershipMap.get(g.id) ?? null,
    }
  })
}

export async function getGroup(groupId: string, userId?: string): Promise<Group | null> {
  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single()

  if (error || !group) return null

  // Get creator profile
  const { data: creator } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", group.creator_id)
    .single()

  let isMember = false
  let userRole = null

  if (userId) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle()

    if (membership) {
      isMember = true
      userRole = membership.role
    }
  }

  return {
    ...group,
    creator_nickname: creator?.nickname ?? null,
    creator_avatar: creator?.avatar_url ?? null,
    is_member: isMember,
    user_role: userRole,
  }
}

export async function updateGroup(groupId: string, data: Partial<CreateGroupData>): Promise<boolean> {
  const { error } = await supabase
    .from("groups")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", groupId)

  return !error
}

export async function deleteGroup(groupId: string): Promise<boolean> {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)

  return !error
}

// ── Membership ──

export async function joinGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
      role: "member",
    })

  if (error) return false

  // Update member count
  await supabase.rpc("increment_member_count", { group_id: groupId }).catch(() => {
    // Fallback: manual count update
    supabase
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .then(({ count }) => {
        supabase
          .from("groups")
          .update({ member_count: count ?? 0 })
          .eq("id", groupId)
      })
  })

  return true
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId)

  if (error) return false

  // Update member count
  const { count } = await supabase
    .from("group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)

  await supabase
    .from("groups")
    .update({ member_count: count ?? 0 })
    .eq("id", groupId)

  return true
}

export async function getGroupMembers(groupId: string): Promise<any[]> {
  const { data: members, error } = await supabase
    .from("group_members")
    .select("id, role, joined_at, user_id")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true })

  if (error || !members) return []

  const userIds = members.map((m) => m.user_id)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, career")
    .in("id", userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return members.map((m) => ({
    ...m,
    profile: profileMap.get(m.user_id) ?? null,
  }))
}

// ── Group Messages ──

export async function getGroupMessages(groupId: string): Promise<GroupMessage[]> {
  const { data: messages, error } = await supabase
    .from("group_messages")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error || !messages) return []

  const senderIds = [...new Set(messages.map((m) => m.sender_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .in("id", senderIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return messages.map((m) => {
    const sender = profileMap.get(m.sender_id)
    return {
      ...m,
      sender_nickname: sender?.nickname ?? null,
      sender_avatar: sender?.avatar_url ?? null,
    }
  }).reverse()
}

export async function sendGroupMessage(groupId: string, senderId: string, content: string): Promise<GroupMessage | null> {
  const { data: message, error } = await supabase
    .from("group_messages")
    .insert({
      group_id: groupId,
      sender_id: senderId,
      content,
    })
    .select()
    .single()

  if (error || !message) return null

  const { data: sender } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", senderId)
    .single()

  return {
    ...message,
    sender_nickname: sender?.nickname ?? null,
    sender_avatar: sender?.avatar_url ?? null,
  }
}

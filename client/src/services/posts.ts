import { supabase } from "./supabase"
import type { Post, PostCreateData, PostComment, PostWithProfile } from "../types/post"

export async function createPost(post: PostCreateData): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    throw new Error(error.message)
  }

  return data as Post
}

export async function getUserPosts(userId: string): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
    throw new Error(error.message)
  }

  const posts = ((data as any[]) ?? []).map((post) => ({
    ...post,
    likes_count: 0,
    comments_count: 0,
  })) as PostWithProfile[]

  await enrichPostCounts(posts)
  return posts
}

export async function getFeedPosts(currentUserId: string): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(nickname, avatar_url, career)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching feed:", error)
    throw new Error(error.message)
  }

  const posts = ((data as any[]) ?? []).map((post) => ({
    ...post,
    likes_count: 0,
    comments_count: 0,
  })) as PostWithProfile[]

  await enrichPostCounts(posts)

  try {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", currentUserId)
      .in("post_id", posts.map((p) => p.id))

    if (likes) {
      const likedSet = new Set(likes.map((l: any) => l.post_id))
      for (const post of posts) {
        post.liked_by_user = likedSet.has(post.id)
      }
    }
  } catch {
    // post_likes table might not exist yet (migration 004)
  }

  return posts
}

async function enrichPostCounts(posts: PostWithProfile[]): Promise<void> {
  if (posts.length === 0) return
  const postIds = posts.map((p) => p.id)

  try {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .in("post_id", postIds)

    if (likes) {
      const map = new Map<string, number>()
      for (const like of likes) {
        map.set(like.post_id, (map.get(like.post_id) ?? 0) + 1)
      }
      for (const post of posts) {
        post.likes_count = map.get(post.id) ?? 0
      }
    }
  } catch {
    // post_likes table not yet created (migration 004)
  }

  try {
    const { data: comments } = await supabase
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds)

    if (comments) {
      const map = new Map<string, number>()
      for (const comment of comments) {
        map.set(comment.post_id, (map.get(comment.post_id) ?? 0) + 1)
      }
      for (const post of posts) {
        post.comments_count = map.get(post.id) ?? 0
      }
    }
  } catch {
    // post_comments table not yet created (migration 004)
  }
}

export async function likePost(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from("post_likes")
    .insert({ user_id: userId, post_id: postId })

  if (error && error.code !== "23505") {
    console.error("Error liking post:", error)
    throw new Error(error.message)
  }
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId)

  if (error) {
    console.error("Error unliking post:", error)
    throw new Error(error.message)
  }
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("post_comments")
    .select(`
      *,
      profile:profiles!post_comments_user_id_fkey(nickname, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as PostComment[]
}

export async function createComment(
  postId: string,
  userId: string,
  content: string,
): Promise<PostComment> {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select(`
      *,
      profile:profiles!post_comments_user_id_fkey(nickname, avatar_url)
    `)
    .single()

  if (error) {
    console.error("Error creating comment:", error)
    throw new Error(error.message)
  }

  return data as unknown as PostComment
}

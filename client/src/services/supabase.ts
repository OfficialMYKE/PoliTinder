import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env"
  )
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
)

async function uploadToBucket(
  bucket: string,
  userId: string,
  file: File,
  prefix: string,
): Promise<string> {
  const fileExt = file.name.split(".").pop() ?? "jpg"
  const fileName = `${userId}/${prefix}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  return uploadToBucket("avatars", userId, file, "avatar")
}

export async function uploadPostImage(
  userId: string,
  file: File
): Promise<string> {
  return uploadToBucket("posts", userId, file, "post")
}

export async function uploadBanner(
  userId: string,
  file: File
): Promise<string> {
  return uploadToBucket("banners", userId, file, "banner")
}

export async function uploadStoryMedia(
  userId: string,
  file: File
): Promise<string> {
  return uploadToBucket("stories", userId, file, "story")
}

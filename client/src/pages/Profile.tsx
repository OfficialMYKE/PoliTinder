import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Image as ImageIcon, Loader2, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getProfile } from "../services/profile"
import { getUserPosts, createPost } from "../services/posts"
import { uploadPostImage } from "../services/supabase"
import { Button } from "../components/ui/button"
import { EditProfile } from "../components/profile/EditProfile"
import { PostCard } from "../components/post/PostCard"
import { FACULTIES } from "../data/academicData"
import type { ProfileData } from "../types/profile"
import type { PostWithProfile } from "../types/post"

const STUDY_STYLE_LABELS: Record<string, string> = {
  madrugador: "Madrugador",
  cafe: "Team Cafeteria",
  grupo: "Grupo de estudio",
  solo: "Solo/a",
  online: "Online",
  nocturno: "Nocturno",
  biblioteca: "Biblioteca",
  tutorias: "Tutorias",
  musica: "Con musica",
  silencio: "Silencio total",
}

const LOOKING_FOR_LABELS: Record<string, string> = {
  study_groups: "Grupos de estudio",
  projects: "Proyectos academicos",
  mentorship: "Mentoria",
  networking: "Networking",
  friends: "Hacer amigos",
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

function resolveFacultyLabel(value: string): string {
  const faculty = FACULTIES.find((f) => f.value === value)
  return faculty?.label ?? value
}

function resolveCareerLabel(value: string): string {
  for (const f of FACULTIES) {
    const career = f.careers.find((c) => c.value === value)
    if (career) return career.label
  }
  return value
}

function DefaultAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#487CFF] text-white font-bold select-none ${className ?? "h-full w-full"}`}
    >
      {getInitial(name)}
    </div>
  )
}

function DefaultBanner() {
  return (
    <div className="h-full w-full bg-gradient-to-r from-[#487CFF]/5 to-[#487CFF]/20" />
  )
}

export default function Profile() {
  const { state } = useAuth()
  const user = state.user
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const [postContent, setPostContent] = useState("")
  const [postImage, setPostImage] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [profileData, userPosts] = await Promise.all([
        getProfile(user.id),
        getUserPosts(user.id),
      ])
      setProfile(profileData)

      const postsWithProfile: PostWithProfile[] = (userPosts ?? []).map((p) => ({
        ...p,
        profile: {
          nickname: profileData?.nickname ?? "",
          avatar_url: profileData?.avatar_url ?? null,
          career: profileData?.career ?? "",
        },
      }))
      setPosts(postsWithProfile)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPostImage(file)
    setPostImagePreview(URL.createObjectURL(file))
  }

  function removeSelectedImage() {
    setPostImage(null)
    if (postImagePreview) URL.revokeObjectURL(postImagePreview)
    setPostImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handlePublish() {
    const trimmed = postContent.trim()
    if ((!trimmed && !postImage) || !user?.id || publishing) return
    setPublishing(true)
    try {
      let imageUrl: string | null = null
      if (postImage) {
        imageUrl = await uploadPostImage(user.id, postImage)
      }
      const newPost = await createPost({
        user_id: user.id,
        content: trimmed || "",
        image_url: imageUrl,
      })
      const newPostWithProfile: PostWithProfile = {
        ...newPost,
        profile: {
          nickname: profile?.nickname ?? "",
          avatar_url: profile?.avatar_url ?? null,
          career: profile?.career ?? "",
        },
      }
      setPosts((prev) => [newPostWithProfile, ...prev])
      setPostContent("")
      removeSelectedImage()
    } catch (err) {
      console.error(err)
    } finally {
      setPublishing(false)
    }
  }

  const nickname =
    profile?.nickname ??
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()

  const email = user?.email ?? ""

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="relative h-48 sm:h-56 md:h-64">
          {profile?.banner_url ? (
            <img
              src={profile.banner_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <DefaultBanner />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        </div>

        <div className="relative -mt-16 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-md">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={nickname}
                className="h-full w-full object-cover"
              />
            ) : (
              <DefaultAvatar name={nickname} className="h-full w-full text-3xl" />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider truncate">
                {nickname}
              </h1>
              {profile && (
                <>
                  <p className="mt-0.5 text-sm text-slate-500 truncate">
                    PREGRADO - {resolveCareerLabel(profile.career).toUpperCase()}
                  </p>
                  {email && (
                    <p className="mt-0.5 text-xs text-[#487CFF] truncate">
                      {email}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <Button className="h-9 gap-1.5 rounded-full bg-[#487CFF] px-4 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#3a6ae0]">
                <Camera className="h-3.5 w-3.5" />
                Anadir a historia
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(true)}
                className="h-9 gap-1.5 rounded-full border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50"
              >
                Editar perfil
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section: ADN Academico */}
      <p className="mb-4 text-base font-medium text-slate-800">ADN Academico</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {profile?.bio && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Sobre mi
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {profile.bio}
              </p>
            </motion.div>
          )}

                    {profile?.study_styles && profile.study_styles.length > 0 && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Preferencias de Estudio
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.study_styles.map((style) => (
                  <span
                    key={style}
                    className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {STUDY_STYLE_LABELS[style] ?? style}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Intereses
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {profile?.looking_for && profile.looking_for.length > 0 && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Buscando
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.looking_for.map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {LOOKING_FOR_LABELS[item] ?? item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <p className="text-base font-medium text-slate-800 -mb-2">Publicaciones</p>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={nickname}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <DefaultAvatar name={nickname} className="h-full w-full text-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handlePublish()
                    }
                  }}
                  placeholder="¿En qué estás trabajando?"
                  className="w-full bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                {postImagePreview && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={postImagePreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-slate-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Foto/Video
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={(!postContent.trim() && !postImage) || publishing}
                    className="h-8 rounded-full bg-[#487CFF] px-4 text-xs font-medium text-white transition-all duration-200 hover:bg-[#3a6ae0] disabled:opacity-50"
                  >
                    {publishing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Publicar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Aún no hay publicaciones
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Crea tu primera publicación académica
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
      </footer>

      <AnimatePresence>
        {editing && profile && user?.id && (
          <EditProfile
            profile={profile}
            userId={user.id}
            onSave={(updated) => {
              setProfile(updated)
              setEditing(false)
            }}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

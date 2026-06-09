import { useState, useRef, useCallback } from "react"
import { X, Image, Loader2, Search, UserPlus, UserCheck } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { createPost } from "../../services/posts"
import { createStory } from "../../services/stories"
import { searchProfiles } from "../../services/profile"
import { uploadPostImage, uploadStoryMedia } from "../../services/supabase"
import type { TaggedUser } from "../../types/post"

interface CreateContentModalProps {
  mode: "post" | "story"
  isOpen: boolean
  onClose: () => void
  onContentCreated: () => void
}

export function CreateContentModal({ mode, isOpen, onClose, onContentCreated }: CreateContentModalProps) {
  const { state } = useAuth()
  const user = state.user
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TaggedUser[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searching, setSearching] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout>

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const results = await searchProfiles(query, user?.id)
      setSearchResults(results.map((p) => ({ id: p.id, nickname: p.nickname, avatar_url: p.avatar_url })))
      setSearching(false)
    }, 300)
  }, [user?.id])

  function addTag(person: TaggedUser) {
    if (taggedUsers.some((t) => t.id === person.id)) return
    setTaggedUsers((prev) => [...prev, person])
    setSearchQuery("")
    setSearchResults([])
  }

  function removeTag(personId: string) {
    setTaggedUsers((prev) => prev.filter((t) => t.id !== personId))
  }

  if (!isOpen) return null

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(null)
    const allowedTypes = mode === "post" ? ALLOWED_IMAGE_TYPES : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
    if (!allowedTypes.includes(file.type)) {
      setFileError("Formato de archivo no soportado. Usa JPG, PNG, WebP o GIF.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("El archivo es demasiado grande. Máximo 50MB.")
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit() {
    if (!user?.id || submitting) return

    if (mode === "post" && !content.trim() && !selectedFile) return
    if (mode === "story" && !selectedFile) return

    setSubmitting(true)
    try {
      const tagIds = taggedUsers.map((t) => t.id)
      if (mode === "post") {
        let imageUrl: string | null = null
        if (selectedFile) {
          imageUrl = await uploadPostImage(user.id, selectedFile)
        }
        await createPost({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
          tags: tagIds.length > 0 ? tagIds : undefined,
        })
      } else {
        if (!selectedFile) return
        const mediaUrl = await uploadStoryMedia(user.id, selectedFile)
        const type = selectedFile.type.startsWith("video/") ? "video" : "image"
        await createStory(user.id, mediaUrl, type, description.trim() || undefined, tagIds.length > 0 ? tagIds : undefined)
      }
      onContentCreated()
      handleClose()
    } catch {
      console.error("Error creating content")
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setContent("")
    setDescription("")
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setTaggedUsers([])
    setSearchQuery("")
    setSearchResults([])
    setShowSearch(false)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            {mode === "post" ? "Crear publicación" : "Agregar historia"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 dark:text-zinc-500 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#487CFF]/10 text-sm font-semibold text-[#487CFF] select-none">
            {user?.firstName?.charAt(0)?.toUpperCase() ?? "U"}
            {user?.lastName?.charAt(0)?.toUpperCase() ?? ""}
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {user?.firstName ?? ""} {user?.lastName ?? ""}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-4">
          {mode === "post" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          )}

          {mode === "story" && !previewUrl && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-8 transition-colors hover:border-slate-400 dark:hover:border-zinc-600">
              <Image className="h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">
                Selecciona una imagen o video
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mb-3">
                JPG, PNG, WebP, MP4 — Máx 50MB
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[#487CFF] px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-105"
              >
                Elegir archivo
              </button>
            </div>
          )}

          {fileError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-600 dark:text-red-400">
              {fileError}
            </div>
          )}

          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden group">
              <div className="relative">
                {mode === "story" && selectedFile?.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    className="w-full max-h-64 object-cover rounded-xl"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-xl"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white transition-all hover:bg-black/80 hover:scale-105"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {mode === "story" && previewUrl && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción..."
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 p-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#487CFF] focus:border-transparent transition-colors"
            />
          )}

          {/* Tag people */}
          <div>
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {taggedUsers.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full bg-[#487CFF]/10 px-2.5 py-1 text-xs font-medium text-[#487CFF]"
                  >
                    @{tag.nickname}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="ml-0.5 rounded-full hover:bg-[#487CFF]/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {showSearch ? (
              <div className="relative">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Buscar personas por nickname..."
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]) }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {searching && (
                  <div className="absolute top-full left-0 right-0 mt-1 flex items-center justify-center py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                )}
                {searchResults.length > 0 && !searching && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-10">
                    {searchResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => addTag(person)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                          {person.nickname.charAt(0).toUpperCase()}
                        </div>
                        <span>{person.nickname}</span>
                        {taggedUsers.some((t) => t.id === person.id) ? (
                          <UserCheck className="ml-auto h-4 w-4 text-[#487CFF]" />
                        ) : (
                          <UserPlus className="ml-auto h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-3 text-center text-sm text-slate-400">
                    No se encontraron personas
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 transition-colors hover:text-[#487CFF]"
              >
                <UserPlus className="h-4 w-4" />
                Etiquetar personas
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 transition-colors hover:text-[#487CFF]"
            >
              <Image className="h-4 w-4" />
              {selectedFile ? "Cambiar archivo" : mode === "post" ? "Agregar imagen" : "Agregar archivo"}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-slate-200 dark:border-zinc-700 px-5 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  submitting ||
                  (mode === "post" && !content.trim() && !selectedFile) ||
                  (mode === "story" && !selectedFile)
                }
                onClick={handleSubmit}
                className="flex items-center gap-1.5 rounded-full bg-[#487CFF] px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "post" ? "Publicar" : "Crear historia"}
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={mode === "post" ? "image/*" : "image/*,video/*"}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

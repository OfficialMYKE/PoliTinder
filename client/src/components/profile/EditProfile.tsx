import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Camera, Loader2, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Combobox } from "../ui/combobox"
import {
  FACULTIES,
  getSemesterOptions,
  STUDY_STYLES,
  INTERESTS,
  LOOKING_FOR_OPTIONS,
} from "../../data/academicData"
import { uploadAvatar, uploadBanner } from "../../services/supabase"
import { updateProfile } from "../../services/profile"
import type { ProfileData } from "../../types/profile"

interface EditProfileProps {
  profile: ProfileData
  userId: string
  onSave: (updated: ProfileData) => void
  onClose: () => void
}

const inputBase =
  "h-12 w-full rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] placeholder:text-slate-400 dark:placeholder:text-zinc-500"

const LABEL_CLASS = "text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block"

export function EditProfile({ profile, userId, onSave, onClose }: EditProfileProps) {
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState(profile.nickname)
  const [bio, setBio] = useState(profile.bio ?? "")
  const [faculty, setFaculty] = useState(profile.faculty)
  const [career, setCareer] = useState(profile.career)
  const [semester, setSemester] = useState<string | null>(
    profile.semester ? String(profile.semester) : null
  )
  const [lookingFor, setLookingFor] = useState<string[]>(profile.looking_for ?? [])
  const [studyStyles, setStudyStyles] = useState<string[]>(profile.study_styles ?? [])
  const [interests, setInterests] = useState<string[]>(profile.interests ?? [])

  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [bannerUrl, setBannerUrl] = useState<string | null>(profile.banner_url)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [saving, setSaving] = useState(false)

  const careers = FACULTIES.find((f) => f.value === faculty)?.careers ?? []
  const semesterOptions = getSemesterOptions(career)

  const facultyOptions = FACULTIES.map((f) => ({ value: f.value, label: f.label }))
  const careerOptions = careers.map((c) => ({ value: c.value, label: c.label }))

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(userId, file)
      setAvatarUrl(url)
    } catch {
      console.error("Error subiendo avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const url = await uploadBanner(userId, file)
      setBannerUrl(url)
    } catch {
      console.error("Error subiendo banner")
    } finally {
      setUploadingBanner(false)
    }
  }

  function toggleValue(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }

  async function handleSave() {
    setSaving(true)
    try {
      const semesterNum = semester
        ? semester === "nivelacion" ? null : Number(semester)
        : null

      await updateProfile(userId, {
        nickname,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        faculty,
        career,
        semester: semesterNum,
        looking_for: lookingFor,
        bio,
        study_styles: studyStyles,
        interests,
      })

      onSave({
        ...profile,
        nickname,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        faculty,
        career,
        semester: semesterNum,
        looking_for: lookingFor,
        bio,
        study_styles: studyStyles,
        interests,
      })
    } catch {
      console.error("Error guardando perfil")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-8 pb-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-xl mx-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Editar perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 dark:text-zinc-500 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Banner */}
          <div>
            <span className={LABEL_CLASS}>Banner</span>
            <button
              type="button"
              onClick={() => bannerRef.current?.click()}
              disabled={uploadingBanner}
              className="relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 transition-colors hover:border-[#487CFF]/40"
            >
              {bannerUrl ? (
                <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-zinc-500">
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Agregar banner</span>
                </div>
              )}
              {uploadingBanner && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </button>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>

          {/* Avatar + Nickname */}
          <div className="flex items-end gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 transition-colors hover:border-[#487CFF]/40"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-0.5 text-slate-400">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="flex-1">
              <span className={LABEL_CLASS}>Apodo</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="¿Cómo te dicen?"
                className={inputBase}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <span className={LABEL_CLASS}>Mini bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe algo sobre ti..."
              maxLength={280}
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3.5 pb-8 text-sm text-slate-900 dark:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
            <div className="mt-1 text-right text-xs tabular-nums text-slate-400 dark:text-zinc-500">
              {bio.length}/280
            </div>
          </div>

          {/* Faculty / Career / Semester */}
          <div className="space-y-4">
            <Combobox
              options={facultyOptions}
              value={faculty}
              onChange={(val) => {
                setFaculty(val)
                setCareer("")
                setSemester(null)
              }}
              placeholder="Facultad"
            />
            <Combobox
              options={careerOptions}
              value={career}
              onChange={(val) => {
                setCareer(val)
                setSemester(null)
              }}
              placeholder={faculty ? "Carrera" : "Selecciona una facultad primero"}
              disabled={!faculty}
            />
            <Combobox
              options={semesterOptions}
              value={semester ?? ""}
              onChange={(val) => setSemester(val || null)}
              placeholder={career ? "Semestre (opcional)" : "Selecciona una carrera primero"}
              disabled={!career}
              clearable
              searchable={false}
            />
          </div>

          {/* Looking For */}
          <div>
            <span className={LABEL_CLASS}>Que buscas en PoliTinder?</span>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((opt) => {
                const selected = lookingFor.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLookingFor(toggleValue(lookingFor, opt.value))}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-[#487CFF] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Study Styles */}
          <div>
            <span className={LABEL_CLASS}>Estilo de estudio</span>
            <div className="flex flex-wrap gap-2">
              {STUDY_STYLES.map((s) => {
                const selected = studyStyles.includes(s.value)
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStudyStyles(toggleValue(studyStyles, s.value))}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-[#487CFF] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interests */}
          <div>
            <span className={LABEL_CLASS}>Intereses</span>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const selected = interests.includes(i.value)
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setInterests(toggleValue(interests, i.value))}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-[#487CFF] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {i.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-full border-slate-200 dark:border-zinc-700 px-5 text-sm text-slate-600 dark:text-zinc-300"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !nickname.trim()}
            className="h-10 rounded-full bg-[#487CFF] px-5 text-sm text-white transition-all hover:bg-[#3a6ae0] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

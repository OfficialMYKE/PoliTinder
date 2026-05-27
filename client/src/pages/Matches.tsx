import { X, Heart, Star, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getPotentialMatches } from "../services/profile"
import { getProfile } from "../services/profile"
import type { ProfileData } from "../types/profile"

const STUDY_STYLE_LABELS: Record<string, string> = {
  madrugador: "Madrugador",
  cafe: "Team Cafetería",
  grupo: "Grupo de estudio",
  solo: "Solo/a",
  online: "Online",
  nocturno: "Nocturno",
  biblioteca: "Biblioteca",
  tutorias: "Tutorías",
  musica: "Con música",
  silencio: "Silencio total",
}

export default function Matches() {
  const { state: authState } = useAuth()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadProfiles = useCallback(async () => {
    if (!authState.user?.id) return
    try {
      const myProfile = await getProfile(authState.user.id)
      if (!myProfile) {
        setLoading(false)
        return
      }
      const matches = await getPotentialMatches(
        myProfile.faculty,
        myProfile.career,
        authState.user.id,
      )
      setProfiles(matches)
    } catch {
      console.error("Error al cargar perfiles")
    } finally {
      setLoading(false)
    }
  }, [authState.user?.id])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const currentProfile = profiles[currentIndex]

  function handleSwipe(direction: "left" | "right") {
    setCurrentIndex((i) => i + 1)
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col min-h-full">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-lg font-semibold text-slate-900">Matches</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No hay más perfiles
            </h2>
            <p className="text-sm text-slate-500">
              Por ahora no hay más estudiantes para mostrar. Vuelve pronto.
            </p>
          </div>
        </div>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-8">
          <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-slate-900">Matches</h1>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 pt-6">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#487CFF]/10 to-blue-100 flex items-center justify-center">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-white/90 shadow-sm">
                {currentProfile.avatar_url ? (
                  <img
                    src={currentProfile.avatar_url}
                    alt={currentProfile.nickname}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-2xl font-bold text-[#487CFF]">
                      {currentProfile.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  {currentProfile.nickname}
                </h2>
              </div>
              <p className="text-sm text-[#487CFF] font-medium mb-3">
                {currentProfile.career}
              </p>
              {currentProfile.bio && (
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {currentProfile.bio}
                </p>
              )}

              {currentProfile.study_styles && currentProfile.study_styles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Estilo de estudio
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfile.study_styles.map((style) => (
                      <span
                        key={style}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {STUDY_STYLE_LABELS[style] ?? style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Intereses
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-[#487CFF]/10 px-3 py-1 text-xs font-medium text-[#487CFF]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              type="button"
              onClick={() => handleSwipe("left")}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-400 shadow-sm transition-all hover:border-red-400 hover:text-red-500 hover:shadow-md"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={() => handleSwipe("right")}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-emerald-400 shadow-sm transition-all hover:border-emerald-400 hover:text-emerald-500 hover:shadow-md"
            >
              <Heart className="h-6 w-6" />
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            {profiles.length - currentIndex - 1} perfiles restantes
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-8">
        <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Heart,
  Loader2,
  Sparkles,
  Ban,
  Crown,
  AlertTriangle,
  Send,
  ShieldOff,
  UserX,
  Users,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getProfile } from "../services/profile"
import { getPotentialMatches } from "../services/profile"
import {
  giveLike,
  giveDislike,
  checkMatch,
  createMatch,
  getDailySwipeCount,
  registerDailySwipe,
  hasReachedDailyLimit,
  getRemainingSwipes,
  getMatchedUserIds,
  getReactedUserIds,
  getBlockedUserIds,
  getSentRequests,
  type SentRequest,
} from "../services/match"
import { blockUser, getBlockedUsers, unblockUser, type BlockedUser } from "../services/blocked"
import { sendFriendRequest, rejectFriendRequest } from "../services/friends"
import { STUDY_STYLE_LABELS, LOOKING_FOR_LABELS } from "../data/labels"
import type { ProfileData } from "../types/profile"

type MatchTab = "discover" | "sent" | "blocked"

/* ── Sent Requests Tab ── */
function SentRequestsTab() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<SentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!authState.user?.id) return
      try {
        const data = await getSentRequests(authState.user.id)
        setRequests(data)
      } catch {
        console.error("Error al cargar solicitudes enviadas")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authState.user?.id])

  async function handleCancel(requestId: string) {
    if (!confirm("Cancelar esta solicitud?")) return
    const ok = await rejectFriendRequest(requestId)
    if (ok) setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
          <Send className="h-7 w-7 text-slate-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">
          Sin solicitudes enviadas
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center max-w-xs">
          Cuando envies solicitudes de conexion, apareceran aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-4 space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
        >
          <div
            className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#487CFF]/10 cursor-pointer"
            onClick={() => navigate("/profile/" + req.receiver_id)}
          >
            {req.receiver_avatar ? (
              <img src={req.receiver_avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-semibold text-[#487CFF]">
                  {req.receiver_nickname?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
              {req.receiver_nickname ?? "Usuario"}
            </p>
            {req.receiver_career && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{req.receiver_career}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/profile/" + req.receiver_id)}
              className="rounded-full border border-slate-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Ver perfil
            </button>
            <button
              type="button"
              onClick={() => handleCancel(req.id)}
              className="rounded-full border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Blocked Tab ── */
function BlockedTab() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!authState.user?.id) return
      try {
        const data = await getBlockedUsers(authState.user.id)
        setBlocked(data)
      } catch {
        console.error("Error al cargar perfiles bloqueados")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authState.user?.id])

  async function handleUnblock(blockedId: string) {
    if (!authState.user?.id) return
    if (!confirm("Desbloquear este usuario? Aparecera nuevamente en tus sugerencias.")) return
    setUnblockingId(blockedId)
    try {
      const ok = await unblockUser(authState.user.id, blockedId)
      if (ok) setBlocked((prev) => prev.filter((b) => b.blocked_id !== blockedId))
    } finally {
      setUnblockingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  if (blocked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
          <ShieldOff className="h-7 w-7 text-slate-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">
          Sin perfiles bloqueados
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center max-w-xs">
          Cuando bloquees usuarios, no volveran a aparecer en tus sugerencias ni podran contactarte.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-4 space-y-3">
      {blocked.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
        >
          <div
            className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            onClick={() => navigate("/profile/" + item.blocked_id)}
          >
            {item.blocked_avatar ? (
              <img src={item.blocked_avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-semibold text-[#487CFF]">
                  {item.blocked_nickname?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
              {item.blocked_nickname ?? "Usuario"}
            </p>
            {item.blocked_career && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{item.blocked_career}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleUnblock(item.blocked_id)}
            disabled={unblockingId === item.blocked_id}
            className="rounded-full bg-[#487CFF] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {unblockingId === item.blocked_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Desbloquear"}
          </button>
        </div>
      ))}
    </div>
  )
}

/* ── Main Matches Component ── */
export default function Matches() {
  const { state: authState } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeProfileIndex, setActiveProfileIndex] = useState(0)
  const [swipesUsed, setSwipesUsed] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set())
  const [reactedUserIds, setReactedUserIds] = useState<Set<string>>(new Set())
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())

  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<ProfileData | null>(null)
  const [swiping, setSwiping] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [focusedOffset, setFocusedOffset] = useState(0)

  const currentTab = (searchParams.get("tab") as MatchTab) || "discover"
  const setTab = (tab: MatchTab) => setSearchParams({ tab })

  const loadData = useCallback(async () => {
    if (!authState.user?.id) return
    try {
      const myProfile = await getProfile(authState.user.id)
      if (!myProfile) {
        setLoading(false)
        return
      }
      setIsPremium(myProfile.is_premium)

      const [potentialMatches, swipeCount, matched, reacted, blocked] = await Promise.all([
        getPotentialMatches(myProfile.faculty, myProfile.career, authState.user.id),
        getDailySwipeCount(authState.user.id),
        getMatchedUserIds(authState.user.id),
        getReactedUserIds(authState.user.id),
        getBlockedUserIds(authState.user.id),
      ])

      setSwipesUsed(swipeCount)
      setMatchedUserIds(new Set(matched))
      setReactedUserIds(new Set(reacted))
      setBlockedUserIds(new Set(blocked))

      const filtered = potentialMatches.filter(
        (p) => !blocked.includes(p.id) && !matched.includes(p.id),
      )
      setProfiles(filtered)
    } catch {
      console.error("Error al cargar perfiles")
    } finally {
      setLoading(false)
    }
  }, [authState.user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset focused offset when activeProfileIndex changes externally
  useEffect(() => {
    setFocusedOffset(0)
  }, [activeProfileIndex])

  const currentProfile = profiles[activeProfileIndex + focusedOffset] ?? profiles[activeProfileIndex]
  const limitReached = hasReachedDailyLimit(swipesUsed, isPremium)
  const remaining = getRemainingSwipes(swipesUsed, isPremium)

  const railItems: FocusRailItem[] = profiles.map((p) => ({
    id: p.id,
    title: p.nickname,
    description: p.bio || undefined,
    imageSrc: p.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(p.nickname) + "&background=487CFF&color=fff&size=400",
    meta: [p.career, p.semester ? "Semestre " + p.semester : ""].filter(Boolean).join(" · "),
  }))

  function handleFocusRailChange(index: number) {
    setFocusedOffset(index)
  }

  async function handleLike() {
    if (!authState.user?.id || !currentProfile || swiping) return
    if (limitReached) {
      setShowLimitModal(true)
      return
    }
    setSwiping(true)
    try {
      const likeSaved = await giveLike(authState.user.id, currentProfile.id)
      if (likeSaved) {
        const newCount = await registerDailySwipe(authState.user.id)
        setSwipesUsed(newCount)
        const isMatch = await checkMatch(authState.user.id, currentProfile.id)
        if (isMatch) {
          const matchCreated = await createMatch(authState.user.id, currentProfile.id)
          if (matchCreated) {
            setMatchedProfile(currentProfile)
            setMatchedUserIds((prev) => new Set([...prev, currentProfile.id]))
            setShowMatchModal(true)
          }
        }
        setReactedUserIds((prev) => new Set([...prev, currentProfile.id]))
      }
    } finally {
      setSwiping(false)
      setActiveProfileIndex((i) => i + 1)
    }
  }

  async function handleDislike() {
    if (!authState.user?.id || !currentProfile || swiping) return
    setSwiping(true)
    try {
      await giveDislike(authState.user.id, currentProfile.id)
      const newCount = await registerDailySwipe(authState.user.id)
      setSwipesUsed(newCount)
    } finally {
      setSwiping(false)
      setActiveProfileIndex((i) => i + 1)
    }
  }

  async function handleBlock() {
    if (!authState.user?.id || !currentProfile) return
    if (!confirm("Bloquear a " + currentProfile.nickname + "?")) return
    const ok = await blockUser(authState.user.id, currentProfile.id)
    if (ok) {
      setBlockedUserIds((prev) => new Set([...prev, currentProfile.id]))
      setActiveProfileIndex((i) => i + 1)
    }
  }

  async function handleSendRequest() {
    if (!authState.user?.id || !currentProfile) return
    const ok = await sendFriendRequest(authState.user.id, currentProfile.id)
    if (ok) setActiveProfileIndex((i) => i + 1)
  }

  function handleStartChat() {
    setShowMatchModal(false)
    navigate("/messages")
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  const noProfiles = profiles.length === 0 || activeProfileIndex >= profiles.length

  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Mis Matches
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Descubre compañeros de estudio compatibles
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 mb-6">
          {([
            ["discover", "Descubrir", Sparkles],
            ["sent", "Enviadas", Send],
            ["blocked", "Bloqueados", ShieldOff],
          ] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all " +
                (currentTab === tab
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {currentTab === "discover" && (
          <div className="flex flex-col">
            {/* Daily limit indicator */}
            {!isPremium && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                  <span>Matches hoy</span>
                  <span className="font-mono">
                    {swipesUsed} / 10
                    {limitReached && (
                      <span className="ml-2 text-red-500 font-semibold">limite</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#487CFF] transition-all duration-300"
                    style={{ width: Math.min(100, (swipesUsed / 10) * 100) + "%" }}
                  />
                </div>
                {remaining !== null && remaining <= 3 && remaining > 0 && (
                  <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Te quedan {remaining} matches hoy.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/premium")}
                      className="underline font-medium hover:text-amber-600"
                    >
                      Obtener ilimitados
                    </button>
                  </p>
                )}
              </div>
            )}

            {isPremium && (
              <div className="mb-4 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                <Crown className="h-3.5 w-3.5" />
                <span className="font-medium">Matches ilimitados</span>
              </div>
            )}

            {/* Profile Carousel or Empty State */}
            {noProfiles ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
                  <Sparkles className="h-7 w-7 text-slate-400 dark:text-zinc-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                  No hay mas perfiles
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 text-center max-w-xs">
                  Vuelve pronto o ajusta tus preferencias de busqueda.
                </p>
              </div>
            ) : (
              <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                {/* 3D Carousel */}
                <FocusRail
                  key={activeProfileIndex}
                  items={railItems.slice(activeProfileIndex, activeProfileIndex + 5)}
                  loop={false}
                  showControls={false}
                  className="h-[400px] rounded-t-2xl"
                  onItemChange={handleFocusRailChange}
                />

                {/* Profile Info */}
                {currentProfile && (
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                          {currentProfile.nickname}
                          {currentProfile.is_premium && (
                            <Crown className="inline-block h-4 w-4 ml-1.5 text-yellow-500" />
                          )}
                        </h2>
                        <p className="text-sm text-[#487CFF] font-medium">
                          {currentProfile.career}
                          {currentProfile.semester && " · Semestre " + currentProfile.semester}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {activeProfileIndex + 1}/{profiles.length}
                      </span>
                    </div>

                    {currentProfile.bio && (
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed line-clamp-3">
                        {currentProfile.bio}
                      </p>
                    )}

                    {currentProfile.study_styles && currentProfile.study_styles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                          Estilo de estudio
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentProfile.study_styles.map((style) => (
                            <span
                              key={style}
                              className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300"
                            >
                              {STUDY_STYLE_LABELS[style] ?? style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                          Intereses
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentProfile.interests.map((interest) => (
                            <span
                              key={interest}
                              className="rounded-full bg-[#487CFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#487CFF]"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleDislike}
                    disabled={swiping}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-200 dark:border-red-900/50 text-red-400 transition-all hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-90 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleBlock}
                    disabled={swiping}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-700 text-slate-400 transition-all hover:border-red-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-90 disabled:opacity-50"
                    title="Bloquear"
                  >
                    <Ban className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={swiping}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-700 text-[#487CFF] transition-all hover:bg-[#487CFF]/10 hover:border-[#487CFF] active:scale-90 disabled:opacity-50"
                    title="Enviar solicitud"
                  >
                    <Send className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={swiping || limitReached}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-200 dark:border-emerald-900/50 text-emerald-400 transition-all hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-90 disabled:opacity-50"
                  >
                    {swiping ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === "sent" && <SentRequestsTab />}
        {currentTab === "blocked" && <BlockedTab />}
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowMatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-8 text-center shadow-2xl border border-slate-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="mb-4"
              >
                <Heart className="h-14 w-14 text-pink-500 mx-auto fill-pink-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1">Match!</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-5">
                Tu y <span className="font-semibold text-[#487CFF]">{matchedProfile.nickname}</span> se gustaron mutuamente
              </p>
              <div className="flex items-center justify-center mb-5">
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-pink-400">
                  {matchedProfile.avatar_url ? (
                    <img src={matchedProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#487CFF]">
                      <span className="text-lg font-bold text-white">
                        {matchedProfile.nickname?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="flex-1 rounded-full border border-slate-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Seguir descubriendo
                </button>
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="flex-1 rounded-full bg-[#487CFF] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Enviar mensaje
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-8 text-center shadow-2xl border border-slate-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Limite diario
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-5">
                Agotaste tus 10 matches diarios. Actualiza a Premium para matches ilimitados.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 rounded-full border border-slate-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLimitModal(false)
                    navigate("/premium")
                  }}
                  className="flex-1 rounded-full bg-[#487CFF] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Crown className="h-4 w-4 inline-block mr-1" />
                  Premium
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

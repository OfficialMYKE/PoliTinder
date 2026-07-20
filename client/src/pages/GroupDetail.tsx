import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, Users, Send, Crown, UserPlus, UserMinus, Settings, Trash2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import {
  getGroup,
  getGroupMembers,
  getGroupMessages,
  sendGroupMessage,
  joinGroup,
  leaveGroup,
  deleteGroup,
  type Group,
  type GroupMessage,
} from "../services/groups"
import { Button } from "../components/ui/button"
import { FACULTIES } from "../data/academicData"

function getInitials(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { state: authState } = useAuth()
  const userId = authState.user?.id

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!groupId) return
    loadData()
  }, [groupId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadData() {
    if (!groupId) return
    setLoading(true)
    const [groupData, membersData, messagesData] = await Promise.all([
      getGroup(groupId, userId),
      getGroupMembers(groupId),
      getGroupMessages(groupId),
    ])
    setGroup(groupData)
    setMembers(membersData)
    setMessages(messagesData)
    setLoading(false)
  }

  async function handleSendMessage() {
    if (!groupId || !userId || !messageInput.trim() || sending) return
    setSending(true)
    const msg = await sendGroupMessage(groupId, userId, messageInput.trim())
    if (msg) {
      setMessages((prev) => [...prev, msg])
      setMessageInput("")
    }
    setSending(false)
  }

  async function handleJoin() {
    if (!groupId || !userId) return
    setActionLoading(true)
    const ok = await joinGroup(groupId, userId)
    if (ok) {
      setGroup((prev) => prev ? { ...prev, is_member: true, member_count: prev.member_count + 1, user_role: "member" } : prev)
      loadData()
    }
    setActionLoading(false)
  }

  async function handleLeave() {
    if (!groupId || !userId) return
    if (!confirm("¿Salir del grupo?")) return
    setActionLoading(true)
    const ok = await leaveGroup(groupId, userId)
    if (ok) {
      setGroup((prev) => prev ? { ...prev, is_member: false, member_count: Math.max(0, prev.member_count - 1), user_role: null } : prev)
      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
    }
    setActionLoading(false)
  }

  async function handleDelete() {
    if (!groupId) return
    if (!confirm("¿Eliminar este grupo? Esta acción no se puede deshacer.")) return
    setActionLoading(true)
    const ok = await deleteGroup(groupId)
    if (ok) navigate("/groups")
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-[#487CFF]" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <p className="text-sm text-slate-500">Grupo no encontrado</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/groups")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{group.name}</h1>
            {group.faculty && (
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {FACULTIES.find((f) => f.value === group.faculty)?.label ?? group.faculty}
                {group.career && ` — ${group.career}`}
              </p>
            )}
          </div>
        </div>

        {/* Group Info Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-900 bg-[#487CFF] shadow-md">
              {group.avatar_url ? (
                <img src={group.avatar_url} alt={group.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {getInitials(group.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{group.name}</h2>
                {group.creator_id === userId && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              {group.description && (
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">{group.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {group.member_count} miembro{group.member_count !== 1 ? "s" : ""}
                </span>
                <span>
                  Creado {new Date(group.created_at).toLocaleDateString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            {group.is_member ? (
              <>
                <Button
                  onClick={() => setShowMembers(!showMembers)}
                  variant="outline"
                  className="h-8 rounded-full border-slate-200 dark:border-zinc-700 text-xs font-medium"
                >
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {showMembers ? "Ocultar" : "Ver"} miembros ({members.length})
                </Button>
                {group.user_role !== "admin" && (
                  <Button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    variant="outline"
                    className="h-8 rounded-full border-red-200 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <UserMinus className="h-3.5 w-3.5 mr-1" />
                    Salir
                  </Button>
                )}
                {group.creator_id === userId && (
                  <Button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    variant="outline"
                    className="h-8 rounded-full border-red-200 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={actionLoading}
                className="h-8 rounded-full bg-[#487CFF] text-white text-xs font-medium hover:bg-[#3a6ae0]"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Unirse al grupo
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Members Panel */}
      {showMembers && group.is_member && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">
            Miembros ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-[#487CFF]">
                  {member.profile?.avatar_url ? (
                    <img src={member.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                      {getInitials(member.profile?.nickname ?? "?")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${member.user_id}`)}
                    className="text-sm font-medium text-slate-900 dark:text-zinc-100 hover:text-[#487CFF] transition-colors truncate"
                  >
                    {member.profile?.nickname ?? "Usuario"}
                  </button>
                  {member.profile?.career && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {member.profile.career}
                    </p>
                  )}
                </div>
                {member.role === "admin" && (
                  <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                )}
                <span className="text-xs text-slate-400 dark:text-zinc-500 shrink-0">
                  {member.role === "admin" ? "Admin" : member.role === "moderator" ? "Mod" : ""}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat */}
      {group.is_member && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
        >
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-10 w-10 text-slate-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  No hay mensajes aún. ¡Sé el primero en escribir!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#487CFF]">
                      {msg.sender_avatar ? (
                        <img src={msg.sender_avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                          {getInitials(msg.sender_nickname ?? "?")}
                        </div>
                      )}
                    </div>
                    <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mb-0.5">
                        {msg.sender_nickname ?? "Usuario"}
                      </p>
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm ${
                          isMe
                            ? "bg-[#487CFF] text-white rounded-tr-sm"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        {new Date(msg.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-zinc-800 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 h-10 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/50"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sending}
                className="h-10 w-10 rounded-full bg-[#487CFF] text-white flex items-center justify-center transition-colors hover:bg-[#3a6ae0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

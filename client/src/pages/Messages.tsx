import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import {
  getConversations,
  getMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToConversations,
  getOtherParticipant,
} from "../services/messages";
import type {
  ConversationWithLastMessage,
  MessageWithProfile,
} from "../types/message";
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Edit3,
  X,
  MoreVertical,
  Video,
  Phone,
  Paperclip,
  Smile,
  Archive,
  UserPlus,
  Check,
  XCircle,
  Bot,
} from "lucide-react";
import ChatBot from "../components/chat/ChatBot";
import { supabase } from "../services/supabase";
import { getOrCreateConversation } from "../services/messages";
import { useCallContext } from "../components/chat/CallHandler";
import { UserStatus } from "../components/chat/UserStatus";
import {
  getIncomingRequests,
  getFriendshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getArchivedConversationIds,
  archiveConversation,
  unarchiveConversation,
  markConversationRead,
  hasUnreadMessages,
  getReadColumn,
} from "../services/friends";
import type { FriendRequest } from "../services/friends";

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😋",
  "😛",
  "😜",
  "🤪",
  "😝",
  "🤑",
  "🤗",
  "🤭",
  "🫣",
  "🤫",
  "🤔",
  "🫡",
  "🤐",
  "🤨",
  "😐",
  "😑",
  "😶",
  "😏",
  "😒",
  "🙄",
  "😬",
  "😮‍💨",
  "🤥",
  "😌",
  "😔",
  "😪",
  "🤤",
  "😴",
  "😷",
  "🤒",
  "🤕",
  "🤢",
  "🤮",
  "🥴",
  "😵",
  "🤯",
  "🤠",
  "🥳",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥶",
  "🥵",
  "🔥",
  "💀",
  "☠️",
  "💩",
  "🤡",
  "👹",
  "👺",
  "👻",
  "💀",
  "☠️",
  "👽",
  "🤖",
  "🎃",
  "😺",
  "😸",
  "👍",
  "👎",
  "👊",
  "✊",
  "🤛",
  "🤜",
  "👏",
  "🙌",
  "👐",
  "🤲",
  "🤝",
  "🙏",
  "✌️",
  "🤟",
  "🤘",
  "👌",
  "✋",
  "🤚",
  "💪",
  "🦵",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "💟",
  "♥️",
  "😂",
  "🔥",
  "❤️",
  "✨",
  "🎉",
  "👍",
  "🙏",
  "💀",
  "👀",
  "😭",
  "😍",
  "🤣",
  "😊",
  "💪",
  "🥺",
  "👏",
  "😅",
  "🤔",
  "🤩",
  "🥹",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}

function shouldShowDateSeparator(curr: string, prev?: string): boolean {
  if (!prev) return true;
  return new Date(curr).toDateString() !== new Date(prev).toDateString();
}

export default function Messages() {
  const { state } = useAuth();
  const currentUserId = state.user?.id;

  const [conversations, setConversations] = useState<
    ConversationWithLastMessage[]
  >([]);
  const [filtered, setFiltered] = useState<ConversationWithLastMessage[]>([]);
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] =
    useState<ConversationWithLastMessage | null>(null);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingError, setSendingError] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<
    { id: string; nickname: string; avatar_url: string | null }[]
  >([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "recientes";

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "pending_sent" | "pending_received" | "accepted"
  >("none");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const [chatBotActive, setChatBotActive] = useState(false);

  // ── Load conversations ──
  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);
    getConversations(currentUserId).then((list) => {
      setConversations(list);
      setFiltered(list);
      setLoading(false);
    });
  }, [currentUserId]);

  // ── Fetch friend requests when tab is solicitudes ──
  useEffect(() => {
    if (!currentUserId || tab !== "solicitudes") {
      setIncomingRequests([]);
      return;
    }
    setRequestsLoading(true);
    getIncomingRequests(currentUserId).then((list) => {
      setIncomingRequests(list);
      setRequestsLoading(false);
    });
  }, [currentUserId, tab]);

  // ── Fetch archived IDs when tab is archivados ──
  useEffect(() => {
    if (!currentUserId) {
      setArchivedIds([]);
      return;
    }
    getArchivedConversationIds(currentUserId).then(setArchivedIds);
  }, [currentUserId]);

  // ── Fetch friendship status when a conversation is selected ──
  useEffect(() => {
    if (!currentUserId || !selectedConv) {
      setFriendshipStatus("none");
      return;
    }
    const other2 = getOtherParticipant(selectedConv, currentUserId);
    getFriendshipStatus(currentUserId, other2.id).then(setFriendshipStatus);
  }, [currentUserId, selectedConv]);

  // ── Close header menu on click outside ──
  useEffect(() => {
    if (!headerMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target as Node)
      ) {
        setHeaderMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [headerMenuOpen]);

  // ── Filter conversations ──
  useEffect(() => {
    let list = conversations;
    if (tab === "archivados") {
      list = list.filter((c) => archivedIds.includes(c.id));
    } else {
      list = list.filter((c) => !archivedIds.includes(c.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const p = getOtherParticipant(c, currentUserId!);
        return p.nickname?.toLowerCase().includes(q);
      });
    }
    setFiltered(list);
  }, [search, conversations, currentUserId, tab, archivedIds]);

  // ── Real-time: listen for new messages in active conversation ──
  useEffect(() => {
    if (!selectedConv) return;
    const unsub = subscribeToMessages(selectedConv.id, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsub;
  }, [selectedConv?.id]);

  // ── Real-time: refresh conversation list when updated ──
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribeToConversations(currentUserId, (updated) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });
      setSelectedConv((prev) => (prev?.id === updated.id ? updated : prev));
    });
    return unsub;
  }, [currentUserId]);

  // ── Auto-scroll to bottom on new messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when conversation changes ──
  useEffect(() => {
    if (selectedConv) inputRef.current?.focus();
  }, [selectedConv]);

  // ── Close emoji picker on click outside ──
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClick(e: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojiPicker]);

  // ── User search for new chat ──
  useEffect(() => {
    if (!showNewChat || !userSearch.trim() || !currentUserId) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setUserSearchLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .ilike("nickname", `%${userSearch.trim()}%`)
        .neq("id", currentUserId)
        .limit(10);
      setUserResults(
        (data ?? []) as {
          id: string;
          nickname: string;
          avatar_url: string | null;
        }[],
      );
      setUserSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, showNewChat, currentUserId]);

  async function handleStartChat(otherUserId: string) {
    if (!currentUserId) return;
    const convId = await getOrCreateConversation(currentUserId, otherUserId);
    if (convId) {
      setShowNewChat(false);
      setUserSearch("");
      setUserResults([]);
      const list = await getConversations(currentUserId);
      setConversations(list);
      setFiltered(list);
      const conv = list.find((c) => c.id === convId);
      if (conv) selectConversation(conv);
    }
  }

  // ── Select conversation ──
  const selectConversation = useCallback(
    async (conv: ConversationWithLastMessage) => {
      setChatBotActive(false);
      setSelectedConv(conv);
      setMessages([]);
      setSendingError("");
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      if (currentUserId) {
        markConversationRead(
          conv.id,
          currentUserId,
          getReadColumn(currentUserId, conv),
        );
      }
    },
    [currentUserId],
  );

  // ── Send message ──
  async function handleSend() {
    if (!selectedConv || !currentUserId || !messageText.trim() || sending)
      return;
    setSendingError("");
    setSending(true);
    const text = messageText.trim();
    setMessageText("");

    const sent = await sendMessage(selectedConv.id, currentUserId, text);
    setSending(false);
    if (!sent) {
      setSendingError("Error al enviar. Intenta de nuevo.");
      setMessageText(text);
    }
  }

  function handleEmojiClick(emoji: string) {
    setMessageText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessageText((prev) => prev + ` [${file.name}]`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const callCtx = useCallContext();

  function goBack() {
    setSelectedConv(null);
    setMessages([]);
    setSendingError("");
  }

  function initiateCall(type: "video" | "voice") {
    if (!selectedConv || !currentUserId || !other?.id) return;
    callCtx?.initiateCall(other.id, selectedConv.id, type);
  }

  const other =
    selectedConv && currentUserId
      ? getOtherParticipant(selectedConv, currentUserId)
      : null;

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* ── Conversation list ── */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950 ${selectedConv ? "hidden md:flex" : "flex"}`}
      >
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {showNewChat
                ? "Nuevo chat"
                : tab === "archivados"
                  ? "Archivados"
                  : tab === "solicitudes"
                    ? "Solicitudes"
                    : "Mensajes"}
            </h1>
            <button
              type="button"
              onClick={() => {
                setShowNewChat(!showNewChat);
                setUserSearch("");
                setUserResults([]);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors"
            >
              {showNewChat ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </button>
          </div>

          {showNewChat ? (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuarios por nombre..."
                className="w-full h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/20"
                autoFocus
              />
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="w-full h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/20"
              />
            </div>
          )}
        </header>

        {/* User search results */}
        {showNewChat && (
          <div className="flex-1 overflow-y-auto">
            {userSearchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              </div>
            ) : userResults.length === 0 && userSearch.trim() ? (
              <div className="flex flex-col items-center text-center px-6 py-12">
                <p className="text-sm text-zinc-500">
                  No se encontraron usuarios
                </p>
              </div>
            ) : userResults.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleStartChat(u.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#487CFF]/10 shrink-0 flex items-center justify-center text-sm font-semibold text-[#487CFF]">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (u.nickname?.charAt(0).toUpperCase() ?? "?")
                      )}
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {u.nickname}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center px-6 py-12">
                <MessageSquare className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">
                  Busca usuarios para iniciar un chat
                </p>
              </div>
            )}
          </div>
        )}

        {!showNewChat && tab === "solicitudes" ? (
          <div className="flex-1 overflow-y-auto">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="flex flex-col items-center text-center px-6 py-20">
                <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  Sin solicitudes
                </h2>
                <p className="text-sm text-zinc-500">
                  No tienes solicitudes de mensaje pendientes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="px-4 py-3.5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#487CFF]/10 shrink-0 flex items-center justify-center text-sm font-semibold text-[#487CFF]">
                      {req.sender_avatar ? (
                        <img
                          src={req.sender_avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (req.sender_nickname ?? "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white block truncate">
                        {req.sender_nickname ?? "Usuario"}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Quiere enviarte un mensaje
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          await acceptFriendRequest(req.id);
                          setIncomingRequests((prev) =>
                            prev.filter((r) => r.id !== req.id),
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#487CFF] text-white text-xs font-medium hover:bg-[#487CFF]/90 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await rejectFriendRequest(req.id);
                          setIncomingRequests((prev) =>
                            prev.filter((r) => r.id !== req.id),
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          !showNewChat && (
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center text-center px-6 py-20">
                  <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    {search
                      ? "Sin resultados"
                      : tab === "archivados"
                        ? "Sin chats archivados"
                        : "Sin conversaciones"}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {tab === "archivados"
                      ? "Archiva conversaciones desde el menú del chat."
                      : "Responde a una historia para iniciar una conversación."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {/* Chatbot entry */}
                  {!search.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setChatBotActive(true);
                        setSelectedConv(null);
                      }}
                      className={`w-full text-left px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                        chatBotActive
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#487CFF] shrink-0 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white block">
                            PoliBot
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate">
                            Asistente de PoliTinder
                          </span>
                        </div>
                      </div>
                    </button>
                  )}
                  {filtered.map((conv) => {
                    const profile = getOtherParticipant(conv, currentUserId!);
                    const isLastFromMe =
                      conv.last_message_sender_id === currentUserId;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full text-left px-4 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                          selectedConv?.id === conv.id
                            ? "bg-zinc-100 dark:bg-zinc-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#487CFF]/10 shrink-0 flex items-center justify-center text-sm font-semibold text-[#487CFF] relative">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (profile.nickname ?? "?").charAt(0).toUpperCase()
                            )}
                            <UserStatus
                              userId={profile.id}
                              showDot
                              showText={false}
                              className="absolute -bottom-0.5 -right-0.5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white block truncate">
                                {profile.nickname ?? "Usuario"}
                              </span>
                              {conv.last_message_created_at && (
                                <span className="text-[10px] text-zinc-400 shrink-0">
                                  {new Date(
                                    conv.last_message_created_at,
                                  ).toLocaleTimeString("es-MX", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                            {conv.last_message_content && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate">
                                {isLastFromMe && (
                                  <CheckCheck className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                                )}
                                {conv.last_message_content}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* ── Chat view ── */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 ${!selectedConv && !chatBotActive ? "hidden md:flex" : "flex"}`}
      >
        {chatBotActive ? (
          <ChatBot
            onBack={() => {
              setChatBotActive(false);
            }}
          />
        ) : selectedConv && other ? (
          <>
            {/* ── Chat header with status and actions ── */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="md:hidden p-1 -ml-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#487CFF]/10 shrink-0 flex items-center justify-center text-sm font-semibold text-[#487CFF]">
                {other.avatar_url ? (
                  <img
                    src={other.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (other.nickname ?? "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white block truncate">
                  {other.nickname ?? "Usuario"}
                </span>
                <UserStatus
                  userId={other.id}
                  lastSeenAt={other.last_seen_at}
                  className="mt-0.5"
                  showDot
                  showText
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => initiateCall("video")}
                  className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => initiateCall("voice")}
                  className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </button>
                {friendshipStatus === "none" && (
                  <button
                    type="button"
                    onClick={async () => {
                      const other2 = getOtherParticipant(
                        selectedConv,
                        currentUserId!,
                      );
                      await sendFriendRequest(currentUserId!, other2.id);
                      setFriendshipStatus("pending_sent");
                    }}
                    className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Añadir amigo"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHeaderMenuOpen((p) => !p)}
                    className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {headerMenuOpen && (
                    <div
                      ref={headerMenuRef}
                      className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1"
                    >
                      {archivedIds.includes(selectedConv.id) ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await unarchiveConversation(
                              selectedConv.id,
                              currentUserId!,
                            );
                            setArchivedIds((prev) =>
                              prev.filter((id) => id !== selectedConv.id),
                            );
                            setHeaderMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                          Desarchivar chat
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await archiveConversation(
                              selectedConv.id,
                              currentUserId!,
                            );
                            setArchivedIds((prev) => [
                              ...prev,
                              selectedConv.id,
                            ]);
                            setHeaderMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                          Archivar chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <p className="text-sm text-zinc-400">
                    No hay mensajes aún. Envía un saludo.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.sender_id === currentUserId;
                  const prev = idx > 0 ? messages[idx - 1] : undefined;
                  const showDate = shouldShowDateSeparator(
                    msg.created_at,
                    prev?.created_at,
                  );
                  const isFirstOfGroup =
                    !prev || prev.sender_id !== msg.sender_id;
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center py-3">
                          <span className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirstOfGroup ? "mt-2" : "mt-0.5"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMine
                              ? "bg-[#487CFF] text-white rounded-br-md"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
                          }`}
                        >
                          {msg.reply_to_story_id && (
                            <div
                              className={`mb-2 rounded-lg p-2 ${isMine ? "bg-[#3a6ae0]" : "bg-zinc-200 dark:bg-zinc-700"}`}
                            >
                              <div className="border-l-4 border-white/50 pl-2">
                                <p className="text-[11px] font-medium leading-tight opacity-70">
                                  Respondió a tu historia
                                </p>
                              </div>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? "text-white/60 justify-end" : "text-zinc-400"}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString(
                              "es-MX",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                            {isMine && <CheckCheck className="w-3 h-3" />}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Message input bar ── */}
            <footer className="relative border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-950">
              {sendingError && (
                <p className="text-xs text-red-400 mb-2 px-1">{sendingError}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex-1 flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 focus-within:ring-2 focus-within:ring-[#487CFF]/20 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((p) => !p)}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-12 right-0 z-50 w-72 h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-3 grid grid-cols-8 gap-1"
                      >
                        {EMOJIS.map((emoji, i) => (
                          <button
                            key={`${emoji}-${i}`}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="flex items-center justify-center w-7 h-7 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !messageText.trim()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#487CFF] text-white hover:bg-[#487CFF]/90 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex flex-col items-center text-center max-w-sm">
              <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Selecciona una conversación
              </h2>
              <p className="text-sm text-zinc-500">
                Elige un chat de la lista para ver los mensajes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

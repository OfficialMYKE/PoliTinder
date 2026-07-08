import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2, Bot } from "lucide-react";
import {
  sendChatMessage,
  type ChatMessage,
} from "../../services/chatbot";

interface ChatBotProps {
  onBack: () => void;
}

interface Bubble {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  loading?: boolean;
}

const BOT_NAME = "PoliBot";

export default function ChatBot({ onBack }: ChatBotProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");

    const userBubble: Bubble = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setBubbles((prev) => [...prev, userBubble]);

    const history: ChatMessage[] = [
      ...bubbles.map((b) => ({
        role: b.role as "user" | "assistant",
        content: b.content,
      })),
      { role: "user", content: text },
    ];

    const loadingBubble: Bubble = {
      id: "loading",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      loading: true,
    };
    setBubbles((prev) => [...prev, loadingBubble]);
    setSending(true);

    try {
      const answer = await sendChatMessage(history);
      setBubbles((prev) =>
        prev
          .filter((b) => b.id !== "loading")
          .concat({
            id: crypto.randomUUID(),
            role: "assistant",
            content: answer,
            created_at: new Date().toISOString(),
          }),
      );
    } catch {
      setBubbles((prev) =>
        prev
          .filter((b) => b.id !== "loading")
          .concat({
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Lo siento, ocurrió un error. Intenta de nuevo.",
            created_at: new Date().toISOString(),
          }),
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="md:hidden p-1 -ml-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-[#487CFF] shrink-0 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white block">
            {BOT_NAME}
          </span>
          <span className="text-[11px] text-zinc-400">
            Asistente de PoliTinder
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {bubbles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-full bg-[#487CFF]/10 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-[#487CFF]" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              Hola, soy {BOT_NAME}
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs">
              Tu asistente educativo para dudas de desarrollo web. Pregúntame
              lo que quieras.
            </p>
          </div>
        )}

        {bubbles.map((b) => (
          <div
            key={b.id}
            className={`flex ${b.role === "user" ? "justify-end" : "justify-start"} ${b.id === bubbles[0]?.id ? "mt-2" : "mt-0.5"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                b.role === "user"
                  ? "bg-[#487CFF] text-white rounded-br-md"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
              }`}
            >
              {b.loading ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-xs text-zinc-400">Escribiendo...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">{b.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 focus-within:ring-2 focus-within:ring-[#487CFF]/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale a PoliBot..."
              className="flex-1 bg-transparent py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
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
    </div>
  );
}

const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:3000";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  answer?: string;
  error?: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  model?: string,
): Promise<string> {
  const res = await fetch(`${CHATBOT_API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model }),
  });

  if (!res.ok) {
    const data: ChatResponse = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error al conectar con el asistente.");
  }

  const data: ChatResponse = await res.json();
  if (!data.answer) {
    throw new Error("Respuesta vacía del asistente.");
  }
  return data.answer;
}

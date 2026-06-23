type MessageHandler = (data: Record<string, unknown>) => void;
type StatusHandler = (
  status: "connected" | "disconnected" | "reconnecting",
) => void;

const DEFAULT_URL = "ws://localhost:8080";
const RECONNECT_DELAY = 2000;
const PING_INTERVAL = 15000;

let ws: WebSocket | null = null;
let userId: string | null = null;
let url: string = DEFAULT_URL;
let messageHandlers = new Set<MessageHandler>();
let statusHandlers = new Set<StatusHandler>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let intentionalClose = false;

function notifyStatus(status: "connected" | "disconnected" | "reconnecting") {
  statusHandlers.forEach((h) => h(status));
}

function clearTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

function startPing() {
  clearTimers();
  pingTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, PING_INTERVAL);
}

function scheduleReconnect() {
  if (intentionalClose || !userId) return;
  notifyStatus("reconnecting");
  clearTimers();
  reconnectTimer = setTimeout(() => {
    connect(url, userId!);
  }, RECONNECT_DELAY);
}

export function connect(wsUrl?: string, uid?: string): void {
  if (uid) userId = uid;
  if (wsUrl) url = wsUrl;
  if (!userId) return;

  intentionalClose = false;

  if (ws) {
    ws.onclose = null;
    ws.onerror = null;
    ws.onmessage = null;
    ws.close();
    ws = null;
  }

  try {
    ws = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    clearTimers();
    ws!.send(JSON.stringify({ type: "register", userId }));
    notifyStatus("connected");
    startPing();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as Record<string, unknown>;
      messageHandlers.forEach((h) => h(data));
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    clearTimers();
    notifyStatus("disconnected");
    scheduleReconnect();
  };

  ws.onerror = () => {};
}

export function disconnect(): void {
  intentionalClose = true;
  clearTimers();
  if (ws) {
    ws.onclose = null;
    ws.onerror = null;
    ws.close();
    ws = null;
  }
  notifyStatus("disconnected");
}

export function send(message: Record<string, unknown>): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function onMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function onStatus(handler: StatusHandler): () => void {
  statusHandlers.add(handler);
  return () => statusHandlers.delete(handler);
}

export function isConnected(): boolean {
  return ws?.readyState === WebSocket.OPEN;
}

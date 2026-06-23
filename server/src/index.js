const { WebSocketServer } = require("ws")

const PORT = process.env.PORT || 8080

const clients = new Map()

const wss = new WebSocketServer({ port: PORT })

console.log(`[WS] Signaling server running on port ${PORT}`)

wss.on("connection", (ws) => {
  let userId = null

  console.log("[WS] New client connected")

  ws.on("message", (raw) => {
    let message
    try {
      message = JSON.parse(raw.toString())
    } catch {
      return ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }))
    }

    switch (message.type) {
      case "register": {
        userId = message.userId
        if (!userId) return
        clients.set(userId, ws)
        console.log(`[WS] User registered: ${userId} (${clients.size} online)`)

        ws.send(
          JSON.stringify({
            type: "registered",
            userId,
          }),
        )

        broadcastOnlineUsers()
        break
      }

      case "signal": {
        if (!message.targetUserId || !message.roomID || !message.signal) {
          return ws.send(JSON.stringify({ type: "error", message: "Missing signal fields" }))
        }
        const target = clients.get(message.targetUserId)
        if (target && target.readyState === 1) {
          target.send(
            JSON.stringify({
              type: "signal",
              roomID: message.roomID,
              senderUserId: userId,
              signal: message.signal,
            }),
          )
        }
        break
      }

      case "incoming_call": {
        if (!message.targetUserId || !message.callerName || !message.callType || !message.roomID) {
          return ws.send(JSON.stringify({ type: "error", message: "Missing call fields" }))
        }
        const target = clients.get(message.targetUserId)
        if (target && target.readyState === 1) {
          target.send(
            JSON.stringify({
              type: "incoming_call",
              callerName: message.callerName,
              callerID: userId,
              callType: message.callType,
              roomID: message.roomID,
            }),
          )
        }
        break
      }

      case "call_ended": {
        if (!message.targetUserId) return
        const target = clients.get(message.targetUserId)
        if (target && target.readyState === 1) {
          target.send(
            JSON.stringify({
              type: "call_ended",
              roomID: message.roomID,
            }),
          )
        }
        break
      }

      case "ping": {
        ws.send(JSON.stringify({ type: "pong" }))
        break
      }

      default:
        ws.send(JSON.stringify({ type: "error", message: `Unknown message type: ${message.type}` }))
    }
  })

  ws.on("close", () => {
    if (userId) {
      clients.delete(userId)
      console.log(`[WS] User disconnected: ${userId} (${clients.size} online)`)
      broadcastOnlineUsers()
    }
  })

  ws.on("error", (err) => {
    console.error(`[WS] Client error:`, err.message)
    if (userId) {
      clients.delete(userId)
      broadcastOnlineUsers()
    }
  })
})

function broadcastOnlineUsers() {
  const userIds = Array.from(clients.keys())
  const payload = JSON.stringify({ type: "online_users", userIds })
  for (const [, ws] of clients) {
    if (ws.readyState === 1) {
      ws.send(payload)
    }
  }
}

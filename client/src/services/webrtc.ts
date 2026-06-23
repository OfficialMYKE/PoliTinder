import { send, onMessage } from "./ws"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

export interface WebRTCCallbacks {
  onRemoteStream: (stream: MediaStream) => void
  onLocalStream: (stream: MediaStream) => void
  onDisconnect: () => void
  onError: (error: string) => void
}

export async function createWebRTCConnection(
  roomID: string,
  userID: string,
  otherUserId: string,
  callType: "video" | "voice",
  isCaller: boolean,
  callbacks: WebRTCCallbacks,
): Promise<() => void> {
  let destroyed = false
  let pc: RTCPeerConnection | null = null
  let localStream: MediaStream | null = null
  const pendingSignals: Array<Record<string, unknown>> = []

  const cleanupFns: Array<() => void> = []

  function cleanup() {
    destroyed = true
    cleanupFns.forEach((fn) => fn())
    cleanupFns.length = 0
    localStream?.getTracks().forEach((t) => t.stop())
    pc?.close()
    pc = null
    localStream = null
  }

  async function handleSignal(signal: Record<string, unknown>) {
    if (!signal || destroyed) return
    if (!pc) {
      pendingSignals.push(signal)
      return
    }

    try {
      if (signal.type === "offer") {
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp as RTCSessionDescriptionInit))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        send({
          type: "signal",
          targetUserId: otherUserId,
          roomID,
          signal: { type: "answer", sdp: answer },
        })
      } else if (signal.type === "answer") {
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp as RTCSessionDescriptionInit))
      } else if (signal.type === "ice") {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate as RTCIceCandidateInit)).catch(() => {})
      }
    } catch (e: any) {
      if (!destroyed) callbacks.onError(e.message || "Error de señalización")
    }
  }

  function processPendingSignals() {
    while (pendingSignals.length > 0 && pc) {
      handleSignal(pendingSignals.shift()!)
    }
  }

  const unsubMessage = onMessage((data) => {
    if (destroyed) return
    if (data.type === "signal" && data.roomID === roomID) {
      handleSignal(data.signal as Record<string, unknown>)
    }
  })
  cleanupFns.push(unsubMessage)

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    })

    if (destroyed) { cleanup(); return cleanup }

    callbacks.onLocalStream(localStream)

    pc = new RTCPeerConnection(ICE_SERVERS)

    localStream.getTracks().forEach((track) => {
      pc!.addTrack(track, localStream!)
    })

    pc.onicecandidate = (e) => {
      if (e.candidate && !destroyed) {
        send({
          type: "signal",
          targetUserId: otherUserId,
          roomID,
          signal: { type: "ice", candidate: e.candidate.toJSON() },
        })
      }
    }

    pc.ontrack = (e) => {
      if (!destroyed && e.streams[0]) callbacks.onRemoteStream(e.streams[0])
    }

    pc.oniceconnectionstatechange = () => {
      if (destroyed) return
      if (["disconnected", "failed", "closed"].includes(pc?.iceConnectionState ?? "")) {
        callbacks.onDisconnect()
      }
    }

    processPendingSignals()

    if (isCaller) {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      send({
        type: "signal",
        targetUserId: otherUserId,
        roomID,
        signal: { type: "offer", sdp: offer },
      })
    }
  } catch (e: any) {
    if (!destroyed) {
      callbacks.onError(e.message || "Error al conectar")
      cleanup()
    }
  }

  return cleanup
}

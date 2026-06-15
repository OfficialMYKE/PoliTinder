import { supabase } from "./supabase"

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
  _userID: string,
  callType: "video" | "voice",
  isCaller: boolean,
  callbacks: WebRTCCallbacks,
): Promise<() => void> {
  let destroyed = false
  let pc: RTCPeerConnection | null = null
  let localStream: MediaStream | null = null
  let signalChannel: ReturnType<typeof supabase.channel> | null = null
  const pendingSignals: any[] = []

  async function cleanup() {
    destroyed = true
    if (signalChannel) {
      await supabase.removeChannel(signalChannel)
      signalChannel = null
    }
    localStream?.getTracks().forEach((t) => t.stop())
    pc?.close()
    pc = null
    localStream = null
  }

  async function sendSignal(data: unknown) {
    if (!signalChannel || destroyed) return
    await signalChannel.send({
      type: "broadcast",
      event: "webrtc_signal",
      payload: { data },
    })
  }

  function processPendingSignals() {
    while (pendingSignals.length > 0 && pc) {
      handleSignal(pendingSignals.shift())
    }
  }

  async function handleSignal(data: any) {
    if (!data || destroyed) return
    if (!pc) {
      pendingSignals.push(data)
      return
    }

    try {
      if (data.type === "offer") {
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendSignal({ type: "answer", sdp: answer })
      } else if (data.type === "answer") {
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      } else if (data.type === "ice") {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {})
      }
    } catch (e: any) {
      if (!destroyed) callbacks.onError(e.message || "Error de señalización")
    }
  }

  try {
    signalChannel = supabase.channel(`webrtc-${roomID}`)

    await new Promise<void>((resolve, reject) => {
      signalChannel!.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve()
        else if (status === "CHANNEL_ERROR") reject(new Error("No se pudo crear el canal"))
      })
    })

    if (destroyed) { cleanup(); return cleanup }

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
        sendSignal({ type: "ice", candidate: e.candidate.toJSON() })
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

    signalChannel.on("broadcast", { event: "webrtc_signal" }, (payload) => {
      if (destroyed) return
      const { data } = payload as unknown as { data: any }
      handleSignal(data)
    })

    processPendingSignals()

    if (isCaller) {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendSignal({ type: "offer", sdp: offer })
    }
  } catch (e: any) {
    if (!destroyed) {
      callbacks.onError(e.message || "Error al conectar")
      cleanup()
    }
  }

  return cleanup
}

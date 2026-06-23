/**
 * Señalización WebRTC mediante Supabase Realtime
 *
 * Crea una conexión peer-to-peer (video o voz) entre dos usuarios.
 * Los mensajes de señalización (offer, answer, ICE candidates) se
 * intercambian a través de un canal broadcast de Supabase.
 *
 * @param roomID    Identificador único de la sala (ej: `${userA}-${userB}`)
 * @param userID    ID del usuario local (se reserva para futura validación)
 * @param callType  "video" o "voice"
 * @param isCaller  true si este usuario inició la llamada
 * @param callbacks Eventos remotos (stream, desconexión, error)
 * @returns Función para limpiar/colgar la llamada
 */

import { supabase } from "./supabase"

/** Servidores STUN públicos de Google para el descubrimiento de peers */
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
  /** Señales recibidas antes de que el RTCPeerConnection esté listo */
  const pendingSignals: any[] = []

  /** Libera todos los recursos: canal, streams y peer connection */
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

  /** Envía un mensaje de señalización al otro peer por Supabase Realtime */
  async function sendSignal(data: unknown) {
    if (!signalChannel || destroyed) return
    await signalChannel.send({
      type: "broadcast",
      event: "webrtc_signal",
      payload: { data },
    })
  }

  /** Procesa señales acumuladas mientras se inicializaba el peer connection */
  function processPendingSignals() {
    while (pendingSignals.length > 0 && pc) {
      handleSignal(pendingSignals.shift())
    }
  }

  /** Maneja offer, answer y candidatos ICE entrantes */
  async function handleSignal(data: any) {
    if (!data || destroyed) return
    if (!pc) {
      pendingSignals.push(data)
      return
    }

    try {
      if (data.type === "offer") {
        // Recibimos una oferta: creamos una respuesta (answer)
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendSignal({ type: "answer", sdp: answer })
      } else if (data.type === "answer") {
        // Recibimos la respuesta a nuestra oferta
        if (pc.currentRemoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      } else if (data.type === "ice") {
        // Candidato ICE para establecer la ruta de conexión
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {})
      }
    } catch (e: any) {
      if (!destroyed) callbacks.onError(e.message || "Error de señalización")
    }
  }

  try {
    // Canal compartido: ambos peers se suscriben al mismo roomID
    signalChannel = supabase.channel(`webrtc-${roomID}`)

    await new Promise<void>((resolve, reject) => {
      signalChannel!.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve()
        else if (status === "CHANNEL_ERROR") reject(new Error("No se pudo crear el canal"))
      })
    })

    // Si ya se solicitó colgar, salimos
    if (destroyed) { cleanup(); return cleanup }

    // Solicita permisos de cámara y/o micrófono
    localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    })

    if (destroyed) { cleanup(); return cleanup }

    callbacks.onLocalStream(localStream)

    // Crea la conexión peer-to-peer con los servidores STUN
    pc = new RTCPeerConnection(ICE_SERVERS)

    // Publica los tracks locales (audio y opcionalmente video)
    localStream.getTracks().forEach((track) => {
      pc!.addTrack(track, localStream!)
    })

    // Envía los candidatos ICE generados localmente
    pc.onicecandidate = (e) => {
      if (e.candidate && !destroyed) {
        sendSignal({ type: "ice", candidate: e.candidate.toJSON() })
      }
    }

    // Cuando el peer remoto publica sus tracks, los reproducimos
    pc.ontrack = (e) => {
      if (!destroyed && e.streams[0]) callbacks.onRemoteStream(e.streams[0])
    }

    // Detecta desconexión del peer remoto
    pc.oniceconnectionstatechange = () => {
      if (destroyed) return
      if (["disconnected", "failed", "closed"].includes(pc?.iceConnectionState ?? "")) {
        callbacks.onDisconnect()
      }
    }

    // Escucha señales entrantes por el canal de Supabase
    signalChannel.on("broadcast", { event: "webrtc_signal" }, (payload) => {
      if (destroyed) return
      const { data } = payload as unknown as { data: any }
      handleSignal(data)
    })

    // Procesa señales que llegaron antes de tener el peer connection
    processPendingSignals()

    // Si somos el caller, enviamos la oferta inicial
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

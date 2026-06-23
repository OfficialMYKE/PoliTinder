import { useEffect, useRef, useState } from "react"
import { X, Phone, Video, Mic, MicOff, VideoOff } from "lucide-react"
import { createWebRTCConnection } from "../../services/webrtc"

interface VideoCallModalProps {
  callType: "video" | "voice"
  roomID: string
  userID: string
  otherUserId: string
  userName: string
  isCaller?: boolean
  onClose: () => void
}

export function VideoCallModal({
  callType,
  roomID,
  userID,
  otherUserId,
  userName,
  isCaller = true,
  onClose,
}: VideoCallModalProps) {
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(callType === "video")
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(true)

  useEffect(() => {
    let active = true

    async function start() {
      const cleanup = await createWebRTCConnection(
        roomID,
        userID,
        otherUserId,
        callType,
        isCaller,
        {
          onLocalStream: (stream) => {
            if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
            if (localRef.current) localRef.current.srcObject = stream
          },
          onRemoteStream: (stream) => {
            if (!active) return
            if (remoteRef.current) remoteRef.current.srcObject = stream
          },
          onDisconnect: () => {
            if (!active) return
            onClose()
          },
          onError: (msg) => {
            if (!active) return
            setError(msg)
          },
        },
      )

      if (!active) { cleanup(); return }
      cleanupRef.current = cleanup
      setConnecting(false)
    }

    start()

    return () => {
      active = false
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [roomID, userID, otherUserId, callType, isCaller, onClose])

  function toggleMic() {
    const video = localRef.current?.srcObject as MediaStream | null
    if (!video) return
    video.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setMicOn((m) => !m)
  }

  function toggleCam() {
    const video = localRef.current?.srcObject as MediaStream | null
    if (!video) return
    video.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setCamOn((c) => !c)
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col">
      {connecting && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#487CFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-300">Conectando...</p>
          </div>
        </div>
      )}

      {callType === "video" ? (
        <>
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-24 right-4 w-32 h-48 md:w-40 md:h-56 rounded-xl object-cover bg-zinc-800 shadow-lg border-2 border-zinc-700"
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <video ref={remoteRef} autoPlay playsInline className="hidden" />
          <video ref={localRef} autoPlay playsInline muted className="hidden" />
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-[#487CFF]" />
            </div>
            <p className="text-white text-lg font-medium">{userName}</p>
            <p className="text-zinc-400 text-sm mt-1">Llamada de voz</p>
          </div>
        </div>
      )}

      {!connecting && (
        <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-zinc-950/80 to-transparent">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-4 rounded-full transition-colors cursor-pointer ${
              micOn
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-red-500 text-white"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {callType === "video" && (
            <button
              type="button"
              onClick={toggleCam}
              className={`p-4 rounded-full transition-colors cursor-pointer ${
                camOn
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-red-500 text-white"
              }`}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            <Phone className="w-5 h-5 rotate-135" />
          </button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

const APP_ID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID ?? "0", 10)
const SERVER_SECRET = (import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET ?? "") as string

interface VideoCallModalProps {
  callType: string
  roomID: string
  userID: string
  userName: string
  onClose: () => void
}

export function VideoCallModal({ callType, roomID, userID, userName, onClose }: VideoCallModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<ReturnType<typeof import("@zegocloud/zego-uikit-prebuilt").ZegoUIKitPrebuilt.create> | null>(null)

  useEffect(() => {
    if (!APP_ID || !SERVER_SECRET || !containerRef.current) {
      onClose()
      return
    }

    let cancelled = false

    async function initCall() {
      const ZegoUIKitPrebuilt = (await import("@zegocloud/zego-uikit-prebuilt")).ZegoUIKitPrebuilt

      if (cancelled) return

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomID,
        userID,
        userName,
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zpRef.current = zp

      zp.joinRoom({
        container: containerRef.current!,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
        turnOnCameraWhenJoining: callType === 'video',
        onLeaveRoom: () => {
          if (!cancelled) onClose()
        },
      })
    }

    initCall()

    return () => {
      cancelled = true
      zpRef.current?.leaveRoom?.()
      zpRef.current?.destroy?.()
      zpRef.current = null
    }
  }, [roomID, userID, userName, onClose])

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Video container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

import { useState, useEffect, useRef, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

interface AppLayoutProps {
  children: ReactNode
}

const SIDEBAR_COLLAPSED_W = 72
const SIDEBAR_EXPANDED_W = 240

export function AppLayout({ children }: AppLayoutProps) {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  function handleTriggerEnter() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setExpanded(true)
  }

  function handleTriggerLeave() {
    hoverTimeoutRef.current = setTimeout(() => {
      setExpanded(false)
    }, 250)
  }

  function handleSidebarEnter() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setExpanded(true)
  }

  function handleSidebarLeave() {
    hoverTimeoutRef.current = setTimeout(() => {
      setExpanded(false)
    }, 250)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Desktop: always-visible collapsed sidebar + hover expand */}
      {!isMobile && (
        <>
          {/* Invisible trigger zone — wider for easier hover */}
          <div
            className="fixed left-0 top-0 z-50 h-full cursor-pointer"
            style={{ width: SIDEBAR_COLLAPSED_W }}
            onMouseEnter={handleTriggerEnter}
          />

          {/* Sidebar container */}
          <div
            ref={sidebarRef}
            className="fixed left-0 top-0 z-40 h-full transition-[width] duration-300 ease-in-out overflow-hidden"
            style={{ width: expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W }}
            onMouseEnter={handleSidebarEnter}
            onMouseLeave={handleSidebarLeave}
          >
            {/* Always render collapsed version (takes full width of container) */}
            <div className="h-full" style={{ width: SIDEBAR_COLLAPSED_W }}>
              <Sidebar collapsed />
            </div>

            {/* Expanded version overlays on top when expanded */}
            {expanded && (
              <div className="absolute inset-0 h-full" style={{ width: SIDEBAR_EXPANDED_W }}>
                <Sidebar collapsed={false} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Main content — offset by collapsed sidebar width on desktop */}
      <main
        className="min-h-screen"
        style={!isMobile ? { marginLeft: SIDEBAR_COLLAPSED_W } : undefined}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </div>
  )
}

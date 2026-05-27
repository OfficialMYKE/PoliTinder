import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-40 h-full w-60">
        <Sidebar />
      </aside>

      <main className="pl-60">{children}</main>
    </div>
  )
}

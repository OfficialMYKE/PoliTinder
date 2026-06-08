import { Ban, RotateCcw } from "lucide-react"

const suspendedUsers = [
  {
    id: "1",
    name: "Pedro Martínez",
    email: "pedro@epn.edu.ec",
    reason: "Contenido inapropiado",
    date: "01/06/2026",
  },
  {
    id: "2",
    name: "Gabriela Ruiz",
    email: "gabriela@epn.edu.ec",
    reason: "Acoso repetido",
    date: "28/05/2026",
  },
]

export default function SuspendedAccounts() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Cuentas Suspendidas</h1>

      <div className="space-y-4">
        {suspendedUsers.map((u) => (
          <div
            key={u.id}
            className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Ban className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  <span className="font-semibold">{u.name}</span>
                </p>
                <p className="text-xs text-slate-500">{u.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Motivo: {u.reason} — Suspendido el {u.date}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reactivar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

import { NetworkVisualizer } from '../components/NetworkVisualizer'
import { AlertTriangle } from 'lucide-react'

export function AttackDemoPage() {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold tracking-tight text-zinc-100">Attack Demo</div>
          <div className="mt-1 text-sm text-zinc-400">
            Interactive visualization: simulate SYN flood impact on flow.
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 ring-1 ring-rose-500/25">
          <AlertTriangle className="h-4 w-4" />
          Simulation
        </div>
      </div>

      <div className="mt-6">
        <NetworkVisualizer />
      </div>
    </div>
  )
}


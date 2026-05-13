import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/cn'

type Mode = 'normal' | 'attack'

export function NetworkVisualizer() {
  const [mode, setMode] = useState<Mode>('normal')
  const [phase, setPhase] = useState(0)
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)

  const speed = mode === 'attack' ? 0.35 : 1.15
  const stroke = mode === 'attack' ? 'stroke-rose-500' : 'stroke-[#005A43]'
  const glow = mode === 'attack' ? 'shadow-[0_0_35px_rgba(244,63,94,0.15)]' : 'shadow-[0_0_35px_rgba(0,90,67,0.12)]'

  const points = useMemo(() => {
    const w = 640
    const h = 160
    const mid = h / 2
    const amp = mode === 'attack' ? 26 : 18
    const freq = mode === 'attack' ? 0.022 : 0.03
    const lag = mode === 'attack' ? 0.6 : 0

    const xs = Array.from({ length: 66 }, (_, i) => (w / 65) * i)
    const ys = xs.map((x) => {
      const p = phase * speed - x * (freq + lag * 0.007)
      const y = mid + Math.sin(p) * amp + Math.sin(p * 0.55) * (amp * 0.25)
      return y
    })

    let d = `M ${xs[0]} ${ys[0]}`
    for (let i = 1; i < xs.length; i++) d += ` L ${xs[i]} ${ys[i]}`
    return { d, w, h }
  }, [mode, phase, speed])

  useEffect(() => {
    const tick = (t: number) => {
      if (last.current == null) last.current = t
      const dt = Math.min(60, t - last.current)
      last.current = t

      // "Lag" during attack: lower effective frame advancement and occasional stutter
      const stutter = mode === 'attack' && Math.random() < 0.08 ? 0.2 : 1
      const adv = (dt / 1000) * 6.2 * (mode === 'attack' ? 0.55 : 1) * stutter
      setPhase((p) => p + adv)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = null
      last.current = null
    }
  }, [mode])

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className={cn('rounded-2xl border border-[#005A43]/10 bg-white p-4', glow)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Network Traffic Visualizer</div>
            <div className="mt-1 text-xs text-slate-500">
              {mode === 'attack' ? 'SYN flood simulated: congestion + jitter' : 'Baseline flow: stable wave propagation'}
            </div>
          </div>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium ring-1',
              mode === 'attack'
                ? 'bg-rose-100 text-rose-700 ring-rose-200'
                : 'bg-[#005A43]/10 text-[#005A43] ring-[#005A43]/20',
            )}
          >
            {mode === 'attack' ? 'Under Attack' : 'Secure'}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#005A43]/10 bg-[#f0faf5]">
          <svg
            viewBox={`0 0 ${points.w} ${points.h}`}
            className={cn(
              'h-44 w-full',
              mode === 'attack' ? 'opacity-95 blur-[0.2px]' : 'opacity-100',
            )}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveFade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(255,255,255,0)" />
                <stop offset="0.15" stopColor="rgba(255,255,255,0.65)" />
                <stop offset="0.85" stopColor="rgba(255,255,255,0.65)" />
                <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path
              d={points.d}
              className={cn('fill-none', stroke)}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: mode === 'attack' ? 'drop-shadow(0 0 10px rgba(244,63,94,0.3))' : 'drop-shadow(0 0 10px rgba(0,90,67,0.25))' }}
            />
            <path d={points.d} stroke="url(#waveFade)" strokeWidth="8" fill="none" opacity="0.12" />
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-[#005A43]/10 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Controls</div>
        <div className="mt-1 text-xs text-slate-500">Toggle SYN flood to see wave color and lag change.</div>

        <div className="mt-4 grid gap-2">
          <button
            onClick={() => setMode('attack')}
            className="inline-flex items-center justify-center rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-200 transition"
          >
            Simulate SYN Flood
          </button>
          <button
            onClick={() => setMode('normal')}
            className="inline-flex items-center justify-center rounded-xl bg-[#005A43]/10 px-4 py-3 text-sm font-medium text-[#005A43] ring-1 ring-[#005A43]/20 hover:bg-[#005A43]/20 transition"
          >
            Restore Secure Flow
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#005A43]/10 bg-[#f0faf5] p-3">
          <div className="text-xs font-medium text-slate-700">What this shows</div>
          <div className="mt-2 text-xs leading-relaxed text-slate-500">
            Normal mode = smooth wave propagation. Attack mode = jitter and reduced forward progress, mimicking TCP queue congestion during a SYN flood.
          </div>
        </div>
      </div>
    </div>
  )
}


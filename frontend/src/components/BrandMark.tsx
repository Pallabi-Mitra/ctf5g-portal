import { ShieldCheck } from 'lucide-react'

export function BrandMark(props: { variant?: 'dark' | 'light' } = {}) {
  const v = props.variant ?? 'dark'
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          v === 'light'
            ? 'grid h-9 w-9 place-items-center rounded-xl bg-[#005A43]/10 ring-1 ring-[#005A43]/25'
            : 'grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30'
        }
      >
        <ShieldCheck className={v === 'light' ? 'h-5 w-5 text-[#005A43]' : 'h-5 w-5 text-emerald-400'} />
      </div>
      <div className="leading-tight">
        <div className={v === 'light' ? 'text-sm font-semibold tracking-wide text-zinc-900' : 'text-sm font-semibold tracking-wide text-zinc-100'}>
          CTF5G Console
        </div>
        <div className={v === 'light' ? 'text-xs text-zinc-500' : 'text-xs text-zinc-400'}>defense • offense • labs</div>
      </div>
    </div>
  )
}


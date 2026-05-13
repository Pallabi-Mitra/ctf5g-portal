import { cn } from '../lib/cn'
import type { ButtonHTMLAttributes } from 'react'

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'secure' | 'attack' | 'bing' },
) {
  const { className, tone = 'secure', ...rest } = props
  const toneClasses = (() => {
    switch (tone) {
      case 'attack':
        return 'bg-rose-500/15 text-rose-200 ring-rose-500/25 hover:bg-rose-500/20'
      case 'bing':
        return 'bg-[#005A43] text-white ring-[#005A43]/25 hover:bg-[#004a37]'
      default:
        return 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/25 hover:bg-emerald-500/20'
    }
  })()

  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ring-1 transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        toneClasses,
        className,
      )}
    />
  )
}


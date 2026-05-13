import { cn } from '../lib/cn'

export function TextField(props: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  variant?: 'dark' | 'light'
}) {
  const variant = props.variant ?? 'dark'
  return (
    <label className="block">
      <div className={cn('text-xs font-medium', variant === 'light' ? 'text-zinc-700' : 'text-zinc-300')}>
        {props.label}
      </div>
      <input
        type={props.type ?? 'text'}
        value={props.value}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className={cn(
          'mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none ring-0',
          variant === 'light'
            ? cn(
                'border-[#005A43]/25 bg-white/70 text-zinc-900 placeholder:text-zinc-400',
                'focus:border-[#005A43]/60 focus:ring-2 focus:ring-[#005A43]/15',
              )
            : cn(
                'border-zinc-800 bg-zinc-950/40 text-zinc-100 placeholder:text-zinc-600',
                'focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15',
              ),
        )}
      />
    </label>
  )
}


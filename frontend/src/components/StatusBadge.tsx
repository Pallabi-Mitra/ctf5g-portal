import { cn } from '../lib/cn'

export function StatusBadge(props: { solved: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        props.solved
          ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/25'
          : 'bg-zinc-900/60 text-zinc-300 ring-zinc-800/80',
      )}
    >
      {props.solved ? 'Solved' : 'Unsolved'}
    </div>
  )
}


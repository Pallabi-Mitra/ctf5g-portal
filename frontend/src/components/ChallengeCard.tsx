import { useMemo, useState } from 'react'
import type { Challenge } from '../data/challenges'
import { StatusBadge } from './StatusBadge'
import { Button } from './Button'
import { Check, Terminal, X } from 'lucide-react'
import { cn } from '../lib/cn'

export function ChallengeCard(props: {
  challenge: Challenge
  solved: boolean
  onSolve: () => void
}) {
  const [flag, setFlag] = useState('')
  const [result, setResult] = useState<'idle' | 'ok' | 'bad'>('idle')

  const categoryTone = useMemo(() => {
    if (props.challenge.category === 'Network') return 'attack'
    return 'secure'
  }, [props.challenge.category])

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1',
                props.challenge.category === 'Network'
                  ? 'bg-rose-500/10 text-rose-200 ring-rose-500/25'
                  : 'bg-emerald-500/10 text-emerald-200 ring-emerald-500/25',
              )}
            >
              {props.challenge.category}
            </div>
            <StatusBadge solved={props.solved} />
          </div>
          <div className="mt-2 truncate text-base font-semibold text-zinc-100">{props.challenge.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-zinc-400">{props.challenge.description}</div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <Terminal className="h-4 w-4" />
            Submit flag
          </div>
          {result !== 'idle' && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                result === 'ok' ? 'text-emerald-300' : 'text-rose-300',
              )}
            >
              {result === 'ok' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {result === 'ok' ? 'Accepted' : 'Incorrect'}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="text-sm text-emerald-300">$</div>
          <input
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value)
              setResult('idle')
            }}
            placeholder="CTF5G{...}"
            className={cn(
              'w-full bg-transparent font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
              'outline-none',
            )}
          />
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
            onClick={() => {
              setFlag('')
              setResult('idle')
            }}
            type="button"
          >
            Clear
          </button>
          <Button
            tone={categoryTone}
            type="button"
            onClick={() => {
              const ok = flag.trim() === props.challenge.flag
              setResult(ok ? 'ok' : 'bad')
              if (ok) props.onSolve()
            }}
          >
            Validate
          </Button>
        </div>
      </div>
    </div>
  )
}


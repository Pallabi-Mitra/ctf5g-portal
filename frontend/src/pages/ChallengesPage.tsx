import { useEffect, useMemo, useState } from 'react'
import { challenges } from '../data/challenges'
import { ChallengeCard } from '../components/ChallengeCard'
import { Search } from 'lucide-react'

const LS_KEY = 'ctf5g.solved'

export function ChallengesPage() {
  const [query, setQuery] = useState('')
  const [solved, setSolved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, boolean>
      setSolved(parsed ?? {})
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(solved))
  }, [solved])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return challenges
    return challenges.filter((c) => (c.title + ' ' + c.category + ' ' + c.description).toLowerCase().includes(q))
  }, [query])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xl font-semibold tracking-tight text-zinc-100">Challenges</div>
          <div className="mt-1 text-sm text-zinc-400">CTF cards with terminal-style flag submission.</div>
        </div>

        <div className="w-full sm:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges…"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {filtered.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            solved={!!solved[c.id]}
            onSolve={() => setSolved((s) => ({ ...s, [c.id]: true }))}
          />
        ))}
      </div>
    </div>
  )
}


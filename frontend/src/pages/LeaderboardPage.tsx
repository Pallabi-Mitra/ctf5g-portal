import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Star, Zap, RefreshCw, Crown, Target } from 'lucide-react'
import { getLeaderboard } from '../lib/api'
import { cn } from '../lib/cn'

type Entry = { username: string; score: number; solvedCount: number }

const MAX_SCORE = 800 // 8 attacks × 100 pts each

function getMedal(rank: number) {
  if (rank === 1) return { icon: <Crown className="h-5 w-5" />, color: 'text-yellow-400', bg: 'bg-yellow-400/15 ring-yellow-400/30', label: '1st' }
  if (rank === 2) return { icon: <Medal className="h-5 w-5" />, color: 'text-slate-400', bg: 'bg-slate-300/20 ring-slate-300/30', label: '2nd' }
  if (rank === 3) return { icon: <Medal className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-600/15 ring-amber-600/30', label: '3rd' }
  return null
}

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (target - start) * ease)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <span>{display}</span>
}

function ScoreBar({ score, maxScore, delay }: { score: number; maxScore: number; delay: number }) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#005A43] to-emerald-400"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut', delay }}
      />
    </div>
  )
}

function PodiumPillar({ entry, rank, delay }: { entry: Entry; rank: number; delay: number }) {
  const heights = [160, 120, 90]
  const h = heights[rank - 1] ?? 80
  const colors = [
    'from-yellow-400 to-yellow-500',
    'from-slate-300 to-slate-400',
    'from-amber-600 to-amber-700',
  ]
  const gradient = colors[rank - 1] ?? 'from-[#005A43] to-emerald-600'
  const crowns = ['👑', '🥈', '🥉']
  const crown = crowns[rank - 1] ?? ''

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      <div className="text-2xl">{crown}</div>
      <div className="text-sm font-semibold text-zinc-200 max-w-[80px] truncate text-center">{entry.username}</div>
      <div className="text-xs font-bold text-emerald-400">
        <AnimatedCounter target={entry.score} duration={1.2} /> pts
      </div>
      <motion.div
        className={cn('w-20 rounded-t-xl bg-gradient-to-t flex items-end justify-center pb-2', gradient)}
        style={{ height: h }}
        initial={{ height: 0 }}
        animate={{ height: h }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.1 }}
      >
        <span className="text-white font-bold text-lg">#{rank}</span>
      </motion.div>
    </motion.div>
  )
}

export function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await getLeaderboard()
      setEntries(data)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => load(true), 30000)
    return () => clearInterval(id)
  }, [])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400/15 ring-1 ring-yellow-400/30"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
          >
            <Trophy className="h-5 w-5 text-yellow-500" />
          </motion.div>
          <div>
            <div className="font-mono text-xl font-bold text-zinc-100">Leaderboard</div>
            <div className="font-mono text-xs text-zinc-600">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Live rankings'}
            </div>
          </div>
        </div>

        <motion.button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </motion.div>
          Refresh
        </motion.button>
      </div>

      {loading && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Star className="h-8 w-8 text-zinc-700" />
          </motion.div>
          <div className="font-mono text-sm text-zinc-600">Loading rankings…</div>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 font-mono text-sm text-rose-400"
        >
          {error}
        </motion.div>
      )}

      {!loading && !error && entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex flex-col items-center gap-3 text-center"
        >
          <div className="text-4xl">🏆</div>
          <div className="font-mono text-base font-semibold text-zinc-400">No competitors yet</div>
          <div className="font-mono text-xs text-zinc-600">Be the first to solve an attack and claim the top spot!</div>
        </motion.div>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <motion.div
              className="mt-8 flex items-end justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {podiumOrder.map((e, i) => {
                const rank = i === 1 ? 1 : i === 0 ? 2 : 3
                return e ? (
                  <PodiumPillar key={e.username} entry={e} rank={rank} delay={i * 0.15} />
                ) : null
              })}
            </motion.div>
          )}

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: <Trophy className="h-4 w-4 text-yellow-400" />, label: 'Top Score', value: entries[0]?.score ?? 0, suffix: ' pts', color: 'text-yellow-400' },
              { icon: <Target className="h-4 w-4 text-blue-400" />, label: 'Competitors', value: entries.length, suffix: '', color: 'text-blue-400' },
              { icon: <Zap className="h-4 w-4 text-purple-400" />, label: 'Max Possible', value: MAX_SCORE, suffix: ' pts', color: 'text-purple-400' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-600">{s.icon}{s.label}</div>
                <div className={cn('mt-1 font-mono text-xl font-bold', s.color)}>
                  <AnimatedCounter target={s.value} duration={1} />{s.suffix}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Full rankings table */}
          <div className="mt-5">
            <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">Full Rankings</div>
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg">
              {entries.map((entry, idx) => {
                const rank = idx + 1
                const medal = getMedal(rank)
                return (
                  <AnimatePresence key={entry.username}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut', delay: idx * 0.05 }}
                      className={cn(
                        'flex items-center gap-4 px-5 py-4',
                        idx !== entries.length - 1 && 'border-b border-zinc-800',
                        rank === 1 && 'bg-yellow-500/5',
                        rank === 2 && 'bg-zinc-800/30',
                        rank === 3 && 'bg-amber-900/10',
                      )}
                    >
                      {/* Rank badge */}
                      <div className="w-8 shrink-0 text-center">
                        {medal ? (
                          <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full ring-1', medal.bg, medal.color)}>
                            {medal.icon}
                          </div>
                        ) : (
                          <div className="font-mono text-sm font-semibold text-zinc-600">#{rank}</div>
                        )}
                      </div>

                      {/* Avatar + name */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <motion.div
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#005A43]/20 font-mono font-bold text-sm text-emerald-400"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          {entry.username.charAt(0).toUpperCase()}
                        </motion.div>
                        <div className="min-w-0">
                          <div className="truncate font-mono text-sm font-semibold text-zinc-200">{entry.username}</div>
                          <div className="font-mono text-xs text-zinc-600">{entry.solvedCount} / 8 solved</div>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="w-28 shrink-0">
                        <ScoreBar score={entry.score} maxScore={MAX_SCORE} delay={0.3 + idx * 0.05} />
                      </div>

                      {/* Score */}
                      <div className="w-16 shrink-0 text-right">
                        <div className="font-mono text-base font-bold text-emerald-400">
                          <AnimatedCounter target={entry.score} duration={0.8} />
                        </div>
                        <div className="font-mono text-xs text-zinc-600">pts</div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

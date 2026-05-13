import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Trophy, CheckCircle2, Lock, Zap, Star, TrendingUp } from 'lucide-react'
import { getMe } from '../lib/api'
import { attackChallenges } from '../data/attacks'
import { cn } from '../lib/cn'

const MAX_SCORE = 800
const TOTAL_ATTACKS = 8

function AnimatedCounter({ target, duration = 1.2, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <span>{display}{suffix}</span>
}

function CircularProgress({ pct, size = 120, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [animPct, setAnimPct] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 1.2
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setAnimPct(pct * ease)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [pct])

  const offset = circ - (animPct / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#005A43" strokeOpacity={0.1} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#prog-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
      <defs>
        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#005A43" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  )
}

type CategoryInfo = {
  label: string
  color: string
  bg: string
}

function getCategoryStyle(category: string): CategoryInfo {
  switch (category) {
    case 'Web': return { label: 'Web', color: 'text-blue-700', bg: 'bg-blue-100 ring-blue-200' }
    case 'Network': return { label: 'Network', color: 'text-rose-700', bg: 'bg-rose-100 ring-rose-200' }
    case 'Protocol': return { label: 'Protocol', color: 'text-rose-700', bg: 'bg-rose-100 ring-rose-200' }
    case 'Cryptography': return { label: 'Crypto', color: 'text-purple-700', bg: 'bg-purple-100 ring-purple-200' }
    case 'Systems': return { label: 'Systems', color: 'text-orange-700', bg: 'bg-orange-100 ring-orange-200' }
    case '5G Protocol': return { label: '5G', color: 'text-[#005A43]', bg: 'bg-zinc-800 ring-zinc-700' }
    default: return { label: category, color: 'text-zinc-500', bg: 'bg-zinc-800 ring-zinc-700' }
  }
}

function getRank(score: number): { label: string; emoji: string; next: string | null; nextAt: number | null } {
  if (score >= 800) return { label: 'Elite Operator', emoji: '🏆', next: null, nextAt: null }
  if (score >= 600) return { label: 'Senior Analyst', emoji: '🥇', next: 'Elite Operator', nextAt: 800 }
  if (score >= 400) return { label: 'Red Team Member', emoji: '🔴', next: 'Senior Analyst', nextAt: 600 }
  if (score >= 200) return { label: 'Threat Hunter', emoji: '🎯', next: 'Red Team Member', nextAt: 400 }
  if (score >= 100) return { label: 'Apprentice', emoji: '⚡', next: 'Threat Hunter', nextAt: 200 }
  return { label: 'Recruit', emoji: '🔰', next: 'Apprentice', nextAt: 100 }
}

export function ProfilePage() {
  const [data, setData] = useState<{ username: string; score: number; solvedAttacks: string[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Star className="h-8 w-8 text-zinc-700" />
        </motion.div>
        <div className="font-mono text-sm text-zinc-600">Loading profile…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-16 text-center font-mono text-sm text-zinc-600">Could not load profile.</div>
    )
  }

  const pct = Math.round((data.score / MAX_SCORE) * 100)
  const rank = getRank(data.score)
  const solvedSet = new Set(data.solvedAttacks)
  const solvedCount = data.solvedAttacks.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-800 ring-1 ring-zinc-700">
          <User className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <div className="text-xl font-semibold tracking-tight text-zinc-100">Profile</div>
          <div className="text-sm text-zinc-500">Your CTF5G operator record</div>
        </div>
      </div>

      {/* Hero card */}
      <motion.div
        className="mt-6 overflow-hidden rounded-2xl border border-[#005A43]/15 bg-gradient-to-br from-[#005A43] to-[#004a37] p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <div className="relative h-[120px] w-[120px]">
              <CircularProgress pct={pct} size={120} stroke={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white">
                  {data.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-green-200/70">{pct}%</div>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">{data.username}</div>
                <div className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/90">
                  {rank.emoji} {rank.label}
                </div>
              </div>
              <div className="mt-1 text-sm text-green-200/70">SUNY Binghamton · CTF5G Console</div>
            </motion.div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: <Trophy className="h-4 w-4 text-yellow-300" />, label: 'Score', value: data.score, suffix: ' pts' },
                { icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />, label: 'Solved', value: solvedCount, suffix: `/${TOTAL_ATTACKS}` },
                { icon: <TrendingUp className="h-4 w-4 text-blue-300" />, label: 'Progress', value: pct, suffix: '%' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="rounded-xl bg-white/10 px-3 py-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-center gap-1 text-xs text-green-200/60">{s.icon}{s.label}</div>
                  <div className="mt-0.5 text-xl font-bold text-white">
                    <AnimatedCounter target={s.value} duration={1} suffix={s.suffix} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Next rank progress */}
        {rank.next && rank.nextAt && (
          <motion.div
            className="mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between text-xs text-green-200/70 mb-1">
              <span>{rank.label}</span>
              <span>{rank.next} at {rank.nextAt} pts ({rank.nextAt - data.score} more)</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-yellow-300"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((data.score - (rank.nextAt - 200)) / 200) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Attack progress grid */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-300">Attack Challenges</div>
          <div className="font-mono text-xs text-zinc-600">{solvedCount} of {TOTAL_ATTACKS} completed</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {attackChallenges.map((attack, i) => {
            const solved = solvedSet.has(attack.key)
            const cat = getCategoryStyle(attack.category)
            return (
              <motion.div
                key={attack.key}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition',
                  solved
                    ? 'border-[#005A43]/20 bg-zinc-950'
                    : 'border-zinc-800 bg-zinc-900',
                )}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 + i * 0.06 }}
                whileHover={{ scale: 1.015 }}
              >
                {/* Status icon */}
                <motion.div
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                    solved ? 'bg-[#005A43] text-white' : 'bg-zinc-800 text-zinc-500',
                  )}
                  animate={solved ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
                >
                  {solved
                    ? <CheckCircle2 className="h-5 w-5" />
                    : <Lock className="h-5 w-5" />}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1', cat.bg, cat.color)}>
                      {cat.label}
                    </span>
                    {solved && (
                      <motion.span
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, delay: 0.5 + i * 0.06 }}
                      >
                        <Zap className="h-3 w-3" /> +100
                      </motion.span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-zinc-100">{attack.title}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Achievements strip */}
      <motion.div
        className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="mb-3 text-sm font-semibold text-zinc-300">Achievements</div>
        <div className="flex flex-wrap gap-2">
          {[
            { earned: solvedCount >= 1, emoji: '🔰', label: 'First Blood' },
            { earned: solvedSet.has('dom-xss'), emoji: '🌐', label: 'Web Warrior' },
            { earned: solvedSet.has('tcp-syn-flood'), emoji: '🌊', label: 'Flood Master' },
            { earned: solvedSet.has('apt-config'), emoji: '📡', label: '5G Breaker' },
            { earned: solvedSet.has('rop'), emoji: '🔗', label: 'ROP Star' },
            { earned: solvedCount >= 4, emoji: '🎯', label: 'Half Way' },
            { earned: solvedCount >= 8, emoji: '👑', label: 'All Cleared' },
          ].map((a, i) => (
            <motion.div
              key={a.label}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                a.earned
                  ? 'bg-[#005A43] text-white ring-[#005A43]'
                  : 'bg-zinc-900 text-zinc-600 ring-zinc-700',
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.07, type: 'spring', stiffness: 300 }}
            >
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

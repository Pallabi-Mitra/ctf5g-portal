import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { attackChallenges, type AttackChallenge } from '../data/attacks'
import { attackLessons } from '../data/attackLesson'
import { TerminalModal } from '../components/TerminalModal'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { Button } from '../components/Button'
import { submitAttack, getMe } from '../lib/api'
import {
  CheckCircle2, ShieldAlert, Globe, Wifi, Radio, Lock, Cpu, Signal,
  Terminal, ChevronRight, Zap, Trophy, Filter, BookOpen, PlayCircle, Flag
} from 'lucide-react'
import { cn } from '../lib/cn'

// Solved state is now loaded exclusively from the backend (/api/me)
// so it is always tied to the logged-in user, never the browser.

// ── Category config ──────────────────────────────────────────────────────────
type CatConfig = {
  label: string
  icon: React.ReactNode
  glow: string
  border: string
  badge: string
  text: string
  hex: string
}

function getCatConfig(cat: AttackChallenge['category']): CatConfig {
  switch (cat) {
    case 'Web':
      return { label: 'Web', icon: <Globe className="h-5 w-5" />, glow: 'shadow-blue-500/20', border: 'border-blue-500/40 hover:border-blue-400/70', badge: 'bg-blue-500/15 text-blue-300 ring-blue-500/25', text: 'text-blue-400', hex: '#3b82f6' }
    case 'Network':
      return { label: 'Network', icon: <Wifi className="h-5 w-5" />, glow: 'shadow-rose-500/20', border: 'border-rose-500/40 hover:border-rose-400/70', badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/25', text: 'text-rose-400', hex: '#f43f5e' }
    case 'Protocol':
      return { label: 'Protocol', icon: <Radio className="h-5 w-5" />, glow: 'shadow-rose-500/20', border: 'border-rose-500/40 hover:border-rose-400/70', badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/25', text: 'text-rose-400', hex: '#f43f5e' }
    case 'Cryptography':
      return { label: 'Crypto', icon: <Lock className="h-5 w-5" />, glow: 'shadow-purple-500/20', border: 'border-purple-500/40 hover:border-purple-400/70', badge: 'bg-purple-500/15 text-purple-300 ring-purple-500/25', text: 'text-purple-400', hex: '#a855f7' }
    case 'Systems':
      return { label: 'Systems', icon: <Cpu className="h-5 w-5" />, glow: 'shadow-orange-500/20', border: 'border-orange-500/40 hover:border-orange-400/70', badge: 'bg-orange-500/15 text-orange-300 ring-orange-500/25', text: 'text-orange-400', hex: '#f97316' }
    case '5G Protocol':
      return { label: '5G', icon: <Signal className="h-5 w-5" />, glow: 'shadow-emerald-500/20', border: 'border-emerald-500/40 hover:border-emerald-400/70', badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25', text: 'text-emerald-400', hex: '#10b981' }
    default:
      return { label: cat, icon: <Terminal className="h-5 w-5" />, glow: 'shadow-zinc-500/20', border: 'border-zinc-500/40 hover:border-zinc-400/70', badge: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/25', text: 'text-zinc-400', hex: '#71717a' }
  }
}

const DIFFICULTY: Record<AttackChallenge['key'], { label: string; color: string }> = {
  'dom-xss':             { label: 'Easy',   color: 'text-emerald-400' },
  'csrf':                { label: 'Easy',   color: 'text-emerald-400' },
  'packet-sniffing':     { label: 'Easy',   color: 'text-emerald-400' },
  'tcp-syn-flood':       { label: 'Medium', color: 'text-yellow-400'  },
  'timing-side-channel': { label: 'Medium', color: 'text-yellow-400'  },
  'apt-config':          { label: 'Medium', color: 'text-yellow-400'  },
  'meet-in-the-middle':  { label: 'Hard',   color: 'text-rose-400'    },
  'rop':                 { label: 'Hard',   color: 'text-rose-400'    },
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

// ── Blinking cursor ───────────────────────────────────────────────────────────
function Cursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }}
    />
  )
}

// ── Difficulty stars ──────────────────────────────────────────────────────────
function DiffStars({ level }: { level: 'Easy' | 'Medium' | 'Hard' }) {
  const filled = level === 'Easy' ? 1 : level === 'Medium' ? 2 : 3
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <span key={i} className={cn('text-xs', i <= filled ? 'text-yellow-400' : 'text-zinc-700')}>★</span>
      ))}
    </div>
  )
}

// ── Attack Card ───────────────────────────────────────────────────────────────
function AttackCard({ c, solved, idx, onClick }: {
  c: AttackChallenge; solved: boolean; idx: number; onClick: () => void
}) {
  const cat = getCatConfig(c.category)
  const diff = DIFFICULTY[c.key]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: idx * 0.07 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border text-left',
        'transition-shadow duration-300',
        solved
          ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-zinc-900 shadow-lg shadow-emerald-900/20'
          : cn('bg-gradient-to-b from-zinc-800/80 to-zinc-900 shadow-lg', cat.border),
        hovered && !solved && `shadow-xl ${cat.glow}`,
      )}
    >
      {/* Category colour header strip */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${cat.hex}80, ${cat.hex}20)` }}
      />

      {/* Scan line on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-10 h-16"
            style={{ background: `linear-gradient(to bottom, transparent, ${cat.hex}14, transparent)` }}
            initial={{ top: -64 }}
            animate={{ top: '110%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Solved glow overlay */}
      {solved && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 bg-emerald-400/5"
        />
      )}

      {/* SOLVED stamp */}
      {solved && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: -12 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Solved</span>
        </motion.div>
      )}

      <div className="flex flex-1 flex-col p-4 pt-3">
        {/* Category badge */}
        <div className="flex items-center justify-between">
          <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ring-1', cat.badge)}>
            {cat.icon} {cat.label}
          </span>
          <DiffStars level={diff.label as 'Easy' | 'Medium' | 'Hard'} />
        </div>

        {/* Big category icon */}
        <div className="mt-4 mb-3 flex justify-center">
          <motion.div
            className={cn('grid h-14 w-14 place-items-center rounded-2xl ring-1', cat.badge)}
            animate={hovered ? { rotate: [0, -8, 8, -4, 0], scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: hovered ? `0 0 24px ${cat.hex}40` : 'none' }}
          >
            <span style={{ color: cat.hex }} className="scale-150">{cat.icon}</span>
          </motion.div>
        </div>

        {/* Title */}
        <div className="font-mono text-sm font-bold leading-tight text-zinc-100 text-center group-hover:text-white transition-colors">
          {c.title}
        </div>

        {/* Description */}
        <div className="mt-1.5 text-center text-[11px] leading-relaxed text-zinc-600 line-clamp-2">
          {c.description}
        </div>

        {/* Target */}
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-700">{c.targetLabel}</div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-zinc-500">{c.targetValue}</div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <div className={cn('flex items-center gap-1 font-mono text-xs font-bold', diff.color)}>
            {diff.label}
          </div>
          <motion.div
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors',
              solved
                ? 'bg-emerald-500/15 text-emerald-400'
                : cn('ring-1', cat.badge),
            )}
            animate={hovered && !solved ? { x: [0, 2, 0] } : {}}
            transition={{ duration: 0.4, repeat: hovered ? Infinity : 0, repeatDelay: 0.5 }}
          >
            {solved ? (
              <><CheckCircle2 className="h-3 w-3" /> Done</>
            ) : (
              <><Zap className="h-3 w-3" /> {c.points} pts <ChevronRight className="h-3 w-3" /></>
            )}
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}

// ── Learn Tab: animated step flow ────────────────────────────────────────────
function LearnTab({ active }: { active: AttackChallenge }) {
  const lesson = attackLessons[active.key]
  const [visibleStep, setVisibleStep] = useState(0)

  useEffect(() => {
    setVisibleStep(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setVisibleStep(i)
      if (i >= (lesson?.steps.length ?? 0)) clearInterval(id)
    }, 600)
    return () => clearInterval(id)
  }, [active.key])

  if (!lesson) return <div className="text-zinc-500 text-sm">No lesson data available.</div>

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300 leading-relaxed">
        {lesson.summary}
      </div>

      {/* Step flow */}
      <div className="space-y-2">
        {lesson.steps.map((step, i) => (
          <AnimatePresence key={i}>
            {i < visibleStep && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <div className={cn('mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white', step.color)}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg leading-none">{step.emoji}</span>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">{step.actor}</span>
                    <span className="text-sm font-semibold text-zinc-100">{step.action}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 leading-relaxed">{step.detail}</div>
                </div>
                {i < lesson.steps.length - 1 && (
                  <div className="shrink-0 text-zinc-700 self-center">→</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Key insight */}
      {visibleStep >= lesson.steps.length && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 leading-relaxed"
        >
          {lesson.keyInsight}
        </motion.div>
      )}

      {/* Code comparison */}
      {visibleStep >= lesson.steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-2 sm:grid-cols-2"
        >
          <div className="rounded-xl border border-rose-500/20 bg-zinc-950 overflow-hidden">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 border-b border-zinc-800 bg-rose-500/5">
              ❌ Vulnerable Code
            </div>
            <pre className="p-3 text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {lesson.vulnerableCode}
            </pre>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-zinc-950 overflow-hidden">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border-b border-zinc-800 bg-emerald-500/5">
              ✅ Secure Code
            </div>
            <pre className="p-3 text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {lesson.secureCode}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Simulate Tab: typewriter terminal ─────────────────────────────────────────
function SimulateTab({ active }: { active: AttackChallenge }) {
  const lesson = attackLessons[active.key]
  const [lines, setLines] = useState<typeof lesson.sim>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLines([])
    setDone(false)
    setRunning(false)
  }, [active.key])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const run = () => {
    if (running || !lesson) return
    setRunning(true)
    setLines([])
    setDone(false)
    let cumDelay = 0
    lesson.sim.forEach((line, i) => {
      cumDelay += (line.delay ?? 350)
      setTimeout(() => {
        setLines(prev => [...prev, line])
        if (i === lesson.sim.length - 1) { setDone(true); setRunning(false) }
      }, cumDelay)
    })
  }

  const lineColor = (type: string) => {
    switch (type) {
      case 'cmd': return 'text-emerald-300'
      case 'out': return 'text-zinc-400'
      case 'warn': return 'text-yellow-300'
      case 'success': return 'text-emerald-400 font-semibold'
      default: return 'text-zinc-600'
    }
  }
  const linePrefix = (type: string) => {
    switch (type) {
      case 'cmd': return <span className="text-emerald-500 mr-2 select-none">$</span>
      case 'warn': return <span className="text-yellow-400 mr-2 select-none">[!]</span>
      case 'success': return <span className="text-emerald-400 mr-2 select-none">[✓]</span>
      default: return <span className="text-zinc-700 mr-2 select-none">   </span>
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">Simulated attack walkthrough — educational purposes only</div>
        <button
          onClick={run}
          disabled={running}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            running
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30'
          )}
        >
          <PlayCircle className="h-3.5 w-3.5" />
          {running ? 'Running...' : done ? 'Run Again' : 'Run Simulation'}
        </button>
      </div>

      <div className="h-72 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="ml-2 text-zinc-600 text-[10px] tracking-widest uppercase">
            ctf5g attack simulator — {active.title}
          </span>
        </div>

        {lines.length === 0 && !running && (
          <div className="text-zinc-600 text-center pt-8">
            Press "Run Simulation" to see the attack execute step by step
          </div>
        )}

        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={cn('leading-relaxed py-0.5 flex items-start', l.type === 'gap' ? 'py-1' : '', lineColor(l.type))}
          >
            {l.type !== 'gap' && linePrefix(l.type)}
            <span>{l.text}</span>
          </motion.div>
        ))}

        {running && (
          <motion.div
            className="inline-block w-2 h-3.5 bg-emerald-400 ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
        <div ref={bottomRef} />
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-300"
        >
          ⚠️ This simulation is for educational purposes. Understanding attacks is the first step to defending against them.
          Head to the <span className="font-semibold">Defense</span> tab to learn how to stop this attack.
        </motion.div>
      )}
    </div>
  )
}

// ── Flag Tab: submission ──────────────────────────────────────────────────────
function FlagTab({
  active, onSuccess, onScore,
}: {
  active: AttackChallenge
  onSuccess: () => void
  onScore: (n: number) => void
}) {
  const [flag, setFlag] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cat = getCatConfig(active.category)
  const diff = DIFFICULTY[active.key]
  const toneFor = (c: AttackChallenge) =>
    c.category === 'Network' || c.category === 'Protocol' || c.category === 'Systems' || c.category === '5G Protocol' ? 'attack' : 'secure'

  useEffect(() => { setFlag(''); setError(null); setSuccess(false) }, [active.key])

  return (
    <div className="space-y-4">
      {/* Target info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold ring-1', cat.badge)}>
            {cat.icon} {cat.label}
          </span>
          <span className={cn('font-bold', diff.color)}>{diff.label} · {active.points} pts</span>
          <span className="ml-auto font-mono text-zinc-500">
            {active.targetLabel}: <span className="text-zinc-300">{active.targetValue}</span>
          </span>
        </div>
        <div className="mt-2 text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">
          {active.description}
        </div>
      </div>

      {/* Flag input */}
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Enter Flag</div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 focus-within:border-emerald-500/50 transition-colors">
          <span className="text-emerald-400 font-mono select-none">$</span>
          <input
            value={flag}
            onChange={e => { setFlag(e.target.value); setError(null); setSuccess(false) }}
            placeholder="FLAG{...}"
            className="flex-1 bg-transparent font-mono text-sm text-zinc-100 placeholder:text-zinc-700 outline-none"
            onKeyDown={e => { if (e.key === 'Enter' && flag.trim().length >= 6 && !busy) document.getElementById('submit-flag-btn')?.click() }}
          />
          {flag && <button onClick={() => setFlag('')} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-mono text-sm text-rose-300">
            ✗ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.6 }} className="text-2xl">🏆</motion.div>
              <div>
                <div className="text-sm font-bold text-emerald-300">FLAG ACCEPTED</div>
                <div className="text-xs text-emerald-400/70 font-mono mt-0.5">+100 points added to your score</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-2">
        <button onClick={() => { setFlag(''); setError(null); setSuccess(false) }}
          className="rounded-lg px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 font-mono transition">
          clear
        </button>
        <Button id="submit-flag-btn" tone={toneFor(active)} disabled={busy || flag.trim().length < 6 || success}
          onClick={async () => {
            setBusy(true); setError(null)
            try {
              if (flag.trim() !== active.flag) { setError('Incorrect flag — try again.'); return }
              const res = await submitAttack(active.key, flag.trim())
              onScore(res.score); setSuccess(true); onSuccess()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Submission failed')
            } finally { setBusy(false) }
          }}>
          {busy ? 'Submitting…' : '→ Submit Flag'}
        </Button>
      </div>
    </div>
  )
}

// ── 3-tab learning modal body ─────────────────────────────────────────────────
type ModalTab = 'learn' | 'simulate' | 'flag'

function LearningModal({
  active, onSuccess, onScore,
}: {
  active: AttackChallenge
  onSuccess: () => void
  onScore: (n: number) => void
}) {
  const [tab, setTab] = useState<ModalTab>('learn')

  useEffect(() => { setTab('learn') }, [active.key])

  const tabs: { id: ModalTab; icon: React.ReactNode; label: string }[] = [
    { id: 'learn', icon: <BookOpen className="h-3.5 w-3.5" />, label: 'How It Works' },
    { id: 'simulate', icon: <PlayCircle className="h-3.5 w-3.5" />, label: 'Simulate' },
    { id: 'flag', icon: <Flag className="h-3.5 w-3.5" />, label: 'Capture Flag' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
              tab === t.id
                ? 'bg-[#005A43] text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'learn' && <LearnTab active={active} />}
          {tab === 'simulate' && <SimulateTab active={active} />}
          {tab === 'flag' && <FlagTab active={active} onSuccess={onSuccess} onScore={onScore} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Web', 'Network', 'Protocol', 'Cryptography', 'Systems', '5G Protocol'] as const
type FilterCat = typeof CATEGORIES[number]

export function AttacksPage() {
  const [active, setActive] = useState<AttackChallenge | null>(null)
  const [solved, setSolved] = useState<Record<string, boolean>>({})
  const [serverScore, setServerScore] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterCat>('All')
  const [confetti, setConfetti] = useState(false)

  // Load solved state from the backend on mount so it is always
  // tied to the currently logged-in user, never the browser cache.
  useEffect(() => {
    // Clear any stale localStorage data from previous sessions
    localStorage.removeItem('ctf5g.attacks.solved')
    getMe()
      .then(data => {
        const map: Record<string, boolean> = {}
        ;(data.solvedAttacks ?? []).forEach((k: string) => { map[k] = true })
        setSolved(map)
        setServerScore(data.score)
      })
      .catch(() => {})
  }, [])

  const fireConfetti = () => {
    setConfetti(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setConfetti(true))
    })
  }

  const cards = useMemo(
    () => filter === 'All' ? attackChallenges : attackChallenges.filter(c => c.category === filter),
    [filter]
  )

  const solvedCount = Object.values(solved).filter(Boolean).length
  const headerText = useTypewriter('CTF5G :: Attack Console — Select a challenge target', 30)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Mission briefing header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        {/* Background hex grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <motion.div className="h-2 w-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Mission Briefing</span>
          </div>
          <div className="font-mono text-sm text-emerald-400 min-h-[20px]">{headerText}<Cursor /></div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Missions', value: attackChallenges.length, icon: '🎯', color: 'text-blue-400' },
              { label: 'Completed', value: solvedCount, icon: '✅', color: 'text-emerald-400' },
              { label: 'Remaining', value: attackChallenges.length - solvedCount, icon: '🔒', color: 'text-yellow-400' },
              { label: 'Score', value: serverScore ?? 0, icon: '⚡', color: 'text-purple-400', suffix: ' pts' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">{s.icon} {s.label}</div>
                <div className={cn('mt-1 font-mono text-xl font-bold', s.color)}>
                  {s.value}{s.suffix ?? ''}
                </div>
              </div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-zinc-700">
              <span>MISSION PROGRESS</span>
              <span>{Math.round((solvedCount / attackChallenges.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#005A43] via-emerald-500 to-emerald-300"
                initial={{ width: 0 }}
                animate={{ width: `${(solvedCount / attackChallenges.length) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setFilter(cat)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'rounded-full px-3 py-1.5 font-mono text-xs font-semibold transition',
              filter === cat
                ? 'bg-[#005A43] text-white shadow-md shadow-emerald-900/30'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-600 hover:border-zinc-700 hover:text-zinc-300',
            )}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {cards.map((c, idx) => (
            <AttackCard
              key={c.key}
              c={c}
              solved={!!solved[c.key]}
              idx={idx}
              onClick={() => setActive(c)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Confetti burst ── */}
      <ConfettiBurst trigger={confetti} />

      {/* ── Terminal modal ── */}
      <TerminalModal
        open={!!active}
        title={active ? active.title : 'Terminal'}
        badgeTone={
          active && (active.category === 'Network' || active.category === 'Protocol' || active.category === 'Systems' || active.category === '5G Protocol')
            ? 'attack'
            : 'secure'
        }
        onClose={() => setActive(null)}
      >
        {active && (
          <LearningModal
            active={active}
            onSuccess={() => {
              setSolved(s => ({ ...s, [active.key]: true }))
              fireConfetti()
            }}
            onScore={setServerScore}
          />
        )}
      </TerminalModal>
    </div>
  )
}

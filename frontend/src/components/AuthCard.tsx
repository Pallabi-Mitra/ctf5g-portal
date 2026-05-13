import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'

// ── Matrix rain canvas ────────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const FONT_SIZE = 14
    const CHARS = '01アイウエオABCDEF0101101001'
    let drops: number[] = []

    const initDrops = () => {
      const cols = Math.floor(canvas.width / FONT_SIZE)
      drops = Array.from({ length: cols }, () => Math.random() * -80)
    }
    initDrops()
    window.addEventListener('resize', initDrops)

    const draw = () => {
      // Semi-transparent fill creates the trail fade
      ctx.fillStyle = 'rgba(9, 9, 11, 0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${FONT_SIZE}px "Courier New", monospace`

      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * FONT_SIZE

        // Bright leading char vs dim trail
        if (Math.random() > 0.92) {
          ctx.fillStyle = '#6ee7b7' // emerald-300 — bright head
        } else {
          ctx.fillStyle = 'rgba(0, 90, 67, 0.55)' // brand green dim trail
        }

        ctx.fillText(char, x, y * FONT_SIZE)

        // Reset drop to top after it exits screen
        if (y * FONT_SIZE > canvas.height && Math.random() > 0.97) {
          drops[i] = 0
        }
        drops[i] += 0.5
      })
    }

    const id = setInterval(draw, 40)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', initDrops)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
    />
  )
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 35, startDelay = 300) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t0)
  }, [startDelay])

  useEffect(() => {
    if (!started) return
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, started])

  return displayed
}

function Cursor({ color = 'bg-emerald-400' }: { color?: string }) {
  return (
    <motion.span
      className={`inline-block w-2 h-[14px] ${color} ml-0.5 align-middle`}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(1)' }}
    />
  )
}

// ── Floating particles ────────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute h-px w-px rounded-full bg-emerald-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── Main AuthCard ─────────────────────────────────────────────────────────────
export function AuthCard(props: { title: string; subtitle: string; children: ReactNode }) {
  const bootLine1 = useTypewriter('INITIALIZING CTF5G SECURE CONSOLE...', 28, 200)
  const bootLine2 = useTypewriter('AUTHENTICATION REQUIRED — IDENTIFY YOURSELF', 30, 1600)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Matrix rain */}
      <MatrixRain />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,150,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,255,150,1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />

      {/* Center content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">

        {/* Terminal boot text */}
        <div className="mb-8 w-full max-w-md font-mono text-xs space-y-1">
          <div className="text-emerald-500/70">
            {bootLine1}{bootLine1.length < 38 && <Cursor />}
          </div>
          {bootLine1.length >= 38 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-600"
            >
              {bootLine2}{bootLine2.length < 43 && <Cursor color="bg-zinc-500" />}
            </motion.div>
          )}
        </div>

        {/* Card */}
        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              {/* Glow ring */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-[#005A43]/20 blur-sm" />

              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-[0_0_80px_-20px_rgba(0,90,67,0.6)] backdrop-blur-xl">
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                {/* Card header */}
                <div className="border-b border-zinc-800/80 bg-zinc-900/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                      </div>
                      <div className="h-4 w-px bg-zinc-700" />
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="font-mono text-xs font-semibold text-emerald-400">CTF5G</span>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                      SUNY Binghamton
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-6">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      Secure Portal
                    </div>
                  </div>
                  <div className="font-mono text-xl font-bold text-zinc-100">{props.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">{props.subtitle}</div>

                  <div className="mt-6">{props.children}</div>
                </div>

                {/* Bottom scan line animation */}
                <motion.div
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-emerald-500/5 to-transparent"
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

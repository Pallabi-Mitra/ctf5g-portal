import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Particle = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  shape: 'square' | 'diamond' | 'bar'
  rotate: number
  rotateEnd: number
}

// Cybersecurity-themed palette: gold, emerald, electric blue, rose
const COLORS = [
  '#facc15', '#fbbf24',   // gold
  '#10b981', '#6ee7b7',   // emerald
  '#3b82f6', '#93c5fd',   // blue
  '#f43f5e', '#fda4af',   // rose
  '#a78bfa', '#e879f9',   // purple/pink
  '#ffffff',              // white sparks
]

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function makeParticles(count: number, originX: number, originY: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + randomBetween(-20, 20)
    const rad = (angle * Math.PI) / 180
    const speed = randomBetween(120, 320)
    return {
      id: i,
      x: originX,
      y: originY,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed - randomBetween(60, 140), // bias upward
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 9),
      shape: (['square', 'diamond', 'bar'] as const)[Math.floor(Math.random() * 3)],
      rotate: randomBetween(-180, 180),
      rotateEnd: randomBetween(-360, 360),
    }
  })
}

function ParticleEl({ p, duration }: { p: Particle; duration: number }) {
  const shapeStyle =
    p.shape === 'diamond'
      ? { borderRadius: 0, transform: `rotate(45deg)` }
      : p.shape === 'bar'
      ? { width: p.size * 0.4, height: p.size * 1.8, borderRadius: 2 }
      : { borderRadius: 2 }

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: p.x,
        top: p.y,
        width: p.size,
        height: p.size,
        backgroundColor: p.color,
        boxShadow: `0 0 6px 1px ${p.color}80`,
        ...shapeStyle,
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: p.rotate, scale: 1 }}
      animate={{
        x: p.vx,
        y: p.vy + 200, // gravity pull
        opacity: 0,
        rotate: p.rotateEnd,
        scale: [1, 1.2, 0.4],
      }}
      transition={{
        duration,
        ease: [0.2, 0.8, 0.6, 1],
      }}
    />
  )
}

export function ConfettiBurst({
  trigger,
  originX,
  originY,
  count = 48,
}: {
  trigger: boolean
  originX?: number
  originY?: number
  count?: number
}) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const duration = 1.2

  useEffect(() => {
    if (!trigger) return

    // Default to center of screen
    const cx = originX ?? window.innerWidth / 2
    const cy = originY ?? window.innerHeight / 2

    setParticles(makeParticles(count, cx, cy))
    setShow(true)

    const t = setTimeout(() => {
      setShow(false)
      setParticles([])
    }, duration * 1000 + 200)

    return () => clearTimeout(t)
  }, [trigger])

  return (
    <AnimatePresence>
      {show &&
        particles.map(p => (
          <ParticleEl key={p.id} p={p} duration={duration} />
        ))}
    </AnimatePresence>
  )
}

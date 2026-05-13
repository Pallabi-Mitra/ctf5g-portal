import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { X, Minus, Square } from 'lucide-react'
import { cn } from '../lib/cn'

export function TerminalModal(props: {
  open: boolean
  title: string
  badgeTone: 'secure' | 'attack'
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose()
    }
    if (props.open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props.open, props])

  return (
    <AnimatePresence>
      {props.open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={props.onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-3xl overflow-hidden rounded-2xl',
              'border bg-zinc-950',
              'shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)]',
              props.badgeTone === 'attack'
                ? 'border-rose-500/30 shadow-rose-900/30'
                : 'border-emerald-500/30 shadow-emerald-900/20',
            )}
          >
            {/* Subtle top glow line */}
            <div className={cn(
              'absolute inset-x-0 top-0 h-px',
              props.badgeTone === 'attack' ? 'bg-rose-500/50' : 'bg-emerald-500/50',
            )} />

            {/* Title bar — macOS style */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-5 py-3">
              <div className="flex items-center gap-2">
                {/* Traffic lights */}
                <button
                  onClick={props.onClose}
                  className="group h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors"
                  title="Close"
                >
                  <X className="h-2 w-2 text-rose-900 opacity-0 group-hover:opacity-100 m-auto" />
                </button>
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>

              {/* Title */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full animate-pulse',
                  props.badgeTone === 'attack' ? 'bg-rose-400' : 'bg-emerald-400',
                )} />
                <div className="font-mono text-xs font-semibold text-zinc-300">{props.title}</div>
              </div>

              <button
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition"
                onClick={props.onClose}
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5">{props.children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

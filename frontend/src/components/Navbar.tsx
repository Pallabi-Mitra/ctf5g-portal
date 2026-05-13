import { ShieldCheck, Terminal, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      {/* Top green accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <motion.div
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#005A43] ring-1 ring-emerald-500/30"
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-zinc-100 tracking-wide">CTF5G</span>
              <span className="text-zinc-700">|</span>
              <span className="font-mono text-xs text-zinc-500">SUNY Binghamton</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        {/* Center: nav indicators */}
        <div className="hidden md:flex items-center gap-4">
          {['defense', 'offense', 'labs'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{item}</span>
            </div>
          ))}
        </div>

        {/* Right: status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-xs text-zinc-400">Science of Cyber Security</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
            <Terminal className="h-3 w-3 text-emerald-400" />
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">CS 459/559</span>
          </div>
        </div>
      </div>
    </header>
  )
}

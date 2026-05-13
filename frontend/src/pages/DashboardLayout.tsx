import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Bug, Shield, LogOut, Swords, Trophy, User, Network } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { clearToken } from '../lib/auth'
import { Navbar } from '../components/Navbar'
import { getMe } from '../lib/api'

const MAX_SCORE = 800

function generateSliceId(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i)
    hash |= 0
  }
  return String(10000 + Math.abs(hash % 90000))
}

export function DashboardLayout() {
  const [username, setUsername] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [solved, setSolved] = useState(0)

  useEffect(() => {
    getMe()
      .then((data) => {
        setUsername(data.username)
        setScore(data.score)
        setSolved(data.solvedAttacks?.length ?? 0)
      })
      .catch(() => {})
  }, [])

  const pct = score != null ? Math.round((score / MAX_SCORE) * 100) : 0
  const sliceId = username ? generateSliceId(username) : null

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl gap-5 px-4 py-5 md:px-6">
        <aside className="w-64 shrink-0 space-y-3">

          {/* Operator card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#005A43] font-mono text-lg font-bold text-white shadow-lg shadow-emerald-900/40">
                  {username ? username.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-mono text-sm font-bold text-zinc-100">
                  {username ?? '—'}
                </div>
                <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">Operator</div>
              </div>
            </div>

            {/* Slice ID */}
            {sliceId && (
              <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Slice ID</span>
                  <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div className="font-mono text-base font-bold text-emerald-400 tracking-widest">{sliceId}</div>
              </div>
            )}

            {/* Score */}
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="font-mono text-xs text-zinc-500">Score</span>
                </div>
                <span className="font-mono text-xs text-zinc-500">{solved}/8 solved</span>
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-white">
                {score ?? 0}<span className="text-xs text-zinc-600 ml-1">pts</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#005A43] to-emerald-400"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
              </div>
              <div className="mt-1 text-right font-mono text-[10px] text-zinc-700">{pct}% complete</div>
            </div>
          </div>

          {/* Nav */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 shadow-lg">
            <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-700">Navigation</div>
            <nav className="space-y-0.5">
              <SideNavItem to="/app/attacks"     icon={<Swords  className="h-4 w-4" />} label="Attacks"     />
              <SideNavItem to="/app/defense"     icon={<Shield  className="h-4 w-4" />} label="Defense"     />
              <SideNavItem to="/app/attack-demo" icon={<Bug     className="h-4 w-4" />} label="Attack Demo" />
              <SideNavItem to="/app/5g-overview" icon={<Network className="h-4 w-4" />} label="5G Overview" />
              <SideNavItem to="/app/leaderboard" icon={<Trophy  className="h-4 w-4" />} label="Leaderboard" />
              <SideNavItem to="/app/profile"     icon={<User    className="h-4 w-4" />} label="Profile"     />
            </nav>
          </div>

          {/* Session */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-zinc-700">Session</div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 mb-2">
              <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="font-mono text-xs text-zinc-500">JWT authenticated</span>
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() => { clearToken(); window.location.href = '/login' }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg min-h-[calc(100vh-7rem)]">
            <Outlet />
          </div>
          <div className="mt-3 text-center font-mono text-[10px] text-zinc-800 uppercase tracking-widest">
            SUNY Binghamton · CTF5G · Science of Cyber Security
          </div>
        </main>
      </div>
    </div>
  )
}

function SideNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-sm transition-all duration-150',
        isActive ? 'bg-[#005A43] text-white shadow-md shadow-emerald-900/30' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200')
    }>
      {({ isActive }) => (
        <>
          <span className={cn('transition-colors', isActive ? 'text-emerald-300' : 'text-zinc-600 group-hover:text-zinc-400')}>{icon}</span>
          <span>{label}</span>
          {isActive && <motion.div layoutId="nav-indicator" className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </>
      )}
    </NavLink>
  )
}

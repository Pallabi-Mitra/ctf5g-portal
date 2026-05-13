import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { TextField } from '../components/TextField'
import { UserPlus } from 'lucide-react'
import { signup } from '../lib/api'
import { setToken } from '../lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

export function SignupPage() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canSubmit = useMemo(() => username.trim().length >= 3 && password.length >= 6, [username, password])

  return (
    <AuthCard title="Create Account" subtitle="Provision a new operator identity.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!canSubmit) return
          setError(null)
          setBusy(true)
          try {
            const res = await signup(username.trim(), password)
            setToken(res.token)
            nav('/app/attacks')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed')
          } finally {
            setBusy(false)
          }
        }}
      >
        <TextField
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="operator"
          autoComplete="username"
          variant="dark"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="min 6 characters"
          autoComplete="new-password"
          variant="dark"
        />

        <button
          type="submit"
          disabled={!canSubmit || busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40 font-mono"
        >
          <UserPlus className="h-4 w-4" />
          {busy ? 'Creating identity...' : '→ Create Account'}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 font-mono text-xs text-rose-400"
            >
              ✗ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center font-mono text-xs text-zinc-600">
          already registered?{' '}
          <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition">
            login →
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}

import { getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export async function signup(username: string, password: string) {
  return http<{ token: string }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function login(username: string, password: string) {
  return http<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function submitAttack(attackKey: string, flag: string) {
  return http<{ ok: boolean; alreadySolved: boolean; score: number }>('/api/attacks/submit', {
    method: 'POST',
    body: JSON.stringify({ attackKey, flag }),
  })
}

export async function getMe() {
  return http<{ username: string; score: number; solvedAttacks: string[] }>('/api/me')
}

export async function getLeaderboard() {
  return http<{ username: string; score: number; solvedCount: number }[]>('/api/leaderboard')
}


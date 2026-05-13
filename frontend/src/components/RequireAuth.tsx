import { Navigate } from 'react-router-dom'
import { getToken } from '../lib/auth'

export function RequireAuth(props: { children: React.ReactNode }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return <>{props.children}</>
}


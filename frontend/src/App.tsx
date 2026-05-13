import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardLayout } from './pages/DashboardLayout'
import { AttackDemoPage } from './pages/AttackDemoPage'
import { AttacksPage } from './pages/AttacksPage'
import { DefensePage } from './pages/DefensePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { RequireAuth } from './components/RequireAuth'
import { Core5GOverviewPage } from './pages/Core5GOverviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/app/attacks" replace />} />
        <Route path="attacks" element={<AttacksPage />} />
        <Route path="defense" element={<DefensePage />} />
        <Route path="attack-demo" element={<AttackDemoPage />} />
        <Route path="5g-overview" element={<Core5GOverviewPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthPage from './components/auth/AuthPage'
import Dashboard from './components/dashboard/Dashboard'
import SermonBuilder from './components/features/SermonBuilder'
import Devotional from './components/features/Devotional'
import WhatsAppBroadcast from './components/features/WhatsAppBroadcast'
import BibleStudy from './components/features/BibleStudy'
import SocialMedia from './components/features/SocialMedia'
import PrayerGenerator from './components/features/PrayerGenerator'
import ModelsPage from './components/openrouter/ModelsPage'
import HistoryPage from './components/history/HistoryPage'
import EvangelismCompanion from './components/features/EvangelismCompanion'

// Redirects to /auth if user is not logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? children : <Navigate to="/auth" replace />
}

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-page)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--gold-light)',
          borderTopColor: 'var(--gold)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Lightline…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protected */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/sermon"     element={<PrivateRoute><SermonBuilder /></PrivateRoute>} />
      <Route path="/devotional" element={<PrivateRoute><Devotional /></PrivateRoute>} />
      <Route path="/whatsapp"   element={<PrivateRoute><WhatsAppBroadcast /></PrivateRoute>} />
      <Route path="/bible-study" element={<PrivateRoute><BibleStudy /></PrivateRoute>} />
      <Route path="/social"     element={<PrivateRoute><SocialMedia /></PrivateRoute>} />
      <Route path="/prayer"     element={<PrivateRoute><PrayerGenerator /></PrivateRoute>} />
      <Route path="/models" element={<PrivateRoute><ModelsPage /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
      <Route path="/evangelism" element={<PrivateRoute><EvangelismCompanion /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


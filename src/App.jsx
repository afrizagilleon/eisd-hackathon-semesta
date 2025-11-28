import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import useAudio from './hooks/useAudio'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Play from './pages/Play'
import Difficulty from './pages/Difficulty'
import Laboratory from './pages/Laboratory'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white'
      }}>
        Memuat...
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" />
}

function AppContent() {
  const { initializeAudio } = useAudio()

  useEffect(() => {
    initializeAudio()
    console.log('ElectroQuest initialized - Ready to learn electronics!')
  }, [])

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/play" element={
        <ProtectedRoute>
          <Play />
        </ProtectedRoute>
      } />
      <Route path="/difficulty/:topic" element={
        <ProtectedRoute>
          <Difficulty />
        </ProtectedRoute>
      } />
      <Route path="/laboratory/:topic/:difficulty" element={
        <ProtectedRoute>
          <Laboratory />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

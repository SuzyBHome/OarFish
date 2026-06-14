import { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getProfile, saveProfile } from './utils/db.js'
import NavBar    from './components/NavBar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ErgTracker  from './components/ErgTracker.jsx'
import TrainHub    from './components/TrainHub.jsx'
import GymTracker  from './components/GymTracker.jsx'
import RunTracker  from './components/RunTracker.jsx'
import Goals       from './components/Goals.jsx'
import Progress    from './components/Progress.jsx'
import Inspiration from './components/Inspiration.jsx'
import Settings    from './components/Settings.jsx'
import Onboarding  from './components/Onboarding.jsx'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const DEFAULT_PROFILE = {
  id: 1, name: '', maxHR: 195,
  currentErg2k: '', targetErg2k: '', startErg2k: '', targetDate: '',
  ftpWatts: 200, weightKg: 0, club: '', side: 'sculls',
}

export default function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile().then(p => {
      setProfile(p || DEFAULT_PROFILE)
      setLoading(false)
    })
  }, [])

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates }
    setProfile(updated)
    await saveProfile(updated)
  }

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-sunset-gradient">
      <div className="text-center">
        <img src="/icons/pwa-192x192.png" className="w-16 h-16 mx-auto mb-3 animate-pulse-slow rounded-2xl" alt="OarFish" />
        <p className="text-sunset-muted text-sm">Loading…</p>
      </div>
    </div>
  )

  const needsOnboarding = !profile?.name

  return (
    <AppContext.Provider value={{ profile, updateProfile }}>
      <div className="min-h-dvh" style={{ background: 'linear-gradient(160deg,#0F0C29 0%,#2D2B55 45%,#1A1A3E 100%)' }}>
        <div className="max-w-md mx-auto relative min-h-dvh">
          {needsOnboarding ? (
            <Onboarding onComplete={updateProfile} />
          ) : (
            <>
              <Routes>
                <Route path="/"         element={<Dashboard />} />
                <Route path="/erg"      element={<ErgTracker />} />
                <Route path="/train"    element={<TrainHub />} />
                <Route path="/train/gym" element={<GymTracker />} />
                <Route path="/train/run" element={<RunTracker />} />
                <Route path="/goals"    element={<Goals />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/inspire"  element={<Inspiration />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
              <NavBar />
            </>
          )}
        </div>
      </div>
    </AppContext.Provider>
  )
}

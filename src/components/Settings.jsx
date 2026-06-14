import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, Unlink, AlertCircle } from 'lucide-react'
import { useApp } from '../App.jsx'
import { getAuthUrl, isConnected as stravaConnected, disconnect as stravaDisconnect } from '../utils/strava.js'
import { isConnected as garminConnected, isConfigured as garminConfigured, startAuth as garminAuth, GARMIN_SETUP_INSTRUCTIONS } from '../utils/garmin.js'
import Card from './common/Card.jsx'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [stravaOk, setStravaOk] = useState(false)
  const [garminOk, setGarminOk] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    stravaConnected().then(setStravaOk)
    garminConnected().then(setGarminOk)

    // Handle Strava callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('code') && params.get('state')) {
      import('../utils/strava.js').then(({ handleCallback }) => {
        handleCallback(params.get('code'), params.get('state'))
          .then(() => { setStravaOk(true); window.history.replaceState({}, '', '/settings') })
          .catch(e => alert('Strava connection failed: ' + e.message))
      })
    }
  }, [])

  const save = async () => {
    await updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/')} className="btn-ghost p-1">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-sunset-text">Settings</h1>
          <p className="text-sunset-muted text-xs">Profile & integrations</p>
        </div>
      </div>

      {/* Profile */}
      <Card className="p-4 space-y-4">
        <p className="section-title">Athlete Profile</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="input-label">Name</label>
            <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="input-label">Club</label>
            <input value={form.club || ''} onChange={e => set('club', e.target.value)} placeholder="Leander Club" />
          </div>
          <div>
            <label className="input-label">Max HR</label>
            <input type="number" value={form.maxHR || ''} onChange={e => set('maxHR', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Weight (kg)</label>
            <input type="number" step="0.1" value={form.weightKg || ''} onChange={e => set('weightKg', parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="input-label">FTP Watts</label>
            <input type="number" value={form.ftpWatts || ''} onChange={e => set('ftpWatts', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Style</label>
            <select value={form.side || 'sculls'} onChange={e => set('side', e.target.value)}>
              <option value="sculls">Sculls</option>
              <option value="sweep">Sweep</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Erg Goal */}
      <Card className="p-4 space-y-3">
        <p className="section-title">Erg Goal</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Start 2k Time</label>
            <input placeholder="6:50.0" value={form.startErg2k || ''} onChange={e => set('startErg2k', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Current 2k Time</label>
            <input placeholder="6:45.0" value={form.currentErg2k || ''} onChange={e => set('currentErg2k', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Target 2k Time</label>
            <input placeholder="6:35.0" value={form.targetErg2k || ''} onChange={e => set('targetErg2k', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Target Date</label>
            <input type="date" value={form.targetDate || ''} onChange={e => set('targetDate', e.target.value)} />
          </div>
        </div>
      </Card>

      <button className="btn-primary w-full" onClick={save}>
        {saved ? '✓ Saved!' : 'Save Profile'}
      </button>

      {/* Strava */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(252,76,2,0.2)' }}>
              <span className="text-[#FC4C02] font-black text-sm">S</span>
            </div>
            <div>
              <p className="text-sunset-text font-bold text-sm">Strava</p>
              <p className="text-sunset-muted text-xs">Sync running & rowing activities</p>
            </div>
          </div>
          {stravaOk ? (
            <span className="text-xs font-bold" style={{ color: '#4CAF50' }}>✓ Connected</span>
          ) : (
            <span className="text-xs text-sunset-muted">Not connected</span>
          )}
        </div>

        {!import.meta.env.VITE_STRAVA_CLIENT_ID && (
          <div className="flex items-start gap-2 p-2 rounded-lg mb-3"
            style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
            <AlertCircle size={14} className="text-sunset-orange shrink-0 mt-0.5" />
            <p className="text-xs text-sunset-muted">
              Add <code className="text-sunset-orange">VITE_STRAVA_CLIENT_ID</code> and{' '}
              <code className="text-sunset-orange">VITE_STRAVA_CLIENT_SECRET</code> to <code>.env</code> to enable Strava sync.
            </p>
          </div>
        )}

        {stravaOk ? (
          <button className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            onClick={async () => { await stravaDisconnect(); setStravaOk(false) }}>
            <Unlink size={14} /> Disconnect Strava
          </button>
        ) : (
          <button
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            onClick={() => { window.location.href = getAuthUrl() }}
            disabled={!import.meta.env.VITE_STRAVA_CLIENT_ID}
          >
            <ExternalLink size={14} /> Connect Strava
          </button>
        )}
      </Card>

      {/* Garmin */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,174,199,0.2)' }}>
              <span className="text-[#00AEC7] font-black text-sm">G</span>
            </div>
            <div>
              <p className="text-sunset-text font-bold text-sm">Garmin</p>
              <p className="text-sunset-muted text-xs">Sync watch & HRV data</p>
            </div>
          </div>
          {garminOk ? (
            <span className="text-xs font-bold" style={{ color: '#4CAF50' }}>✓ Connected</span>
          ) : (
            <span className="text-xs text-sunset-muted">Requires backend</span>
          )}
        </div>

        {!garminConfigured() && (
          <div className="flex items-start gap-2 p-2 rounded-lg mb-3"
            style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
            <AlertCircle size={14} className="text-sunset-orange shrink-0 mt-0.5" />
            <p className="text-xs text-sunset-muted">
              Garmin Health API requires a backend OAuth handler.
              Add <code className="text-sunset-orange">VITE_GARMIN_CLIENT_ID</code> and{' '}
              <code className="text-sunset-orange">VITE_GARMIN_BACKEND_URL</code> to <code>.env</code>.
            </p>
          </div>
        )}

        <button
          className="btn-secondary w-full text-sm"
          onClick={garminAuth}
          disabled={!garminConfigured()}
        >
          {garminOk ? 'Reconnect Garmin' : 'Connect Garmin Watch'}
        </button>
      </Card>

      {/* App Info */}
      <div className="text-center py-4">
        <img src="/icons/oarfish.svg" className="w-10 h-10 mx-auto mb-2" alt="OarFish" />
        <p className="text-sunset-muted text-xs">OarFish v1.0 · Elite Rowing Tracker</p>
        <p className="text-sunset-muted text-xs mt-1">Built for athletes chasing Henley</p>
      </div>
    </div>
  )
}

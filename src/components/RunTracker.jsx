import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronLeft, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addRunSession, getRunSessions, db } from '../utils/db.js'
import { RUN_TYPES, formatRunPace } from '../utils/training.js'
import { isConnected as stravaConnected, getRunActivities, stravaActivityToRunSession } from '../utils/strava.js'
import Card from './common/Card.jsx'

function LogModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    distanceKm: '', durationMin: '', hrAvg: '', hrMax: '',
    type: 'easy', notes: '', elevationM: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const pacePerKm = form.distanceKm && form.durationMin
    ? (parseFloat(form.durationMin) * 60) / parseFloat(form.distanceKm)
    : null

  const save = async () => {
    const dist = parseFloat(form.distanceKm) || 0
    const dur  = parseFloat(form.durationMin) * 60 || 0
    await addRunSession({
      type: form.type,
      name: RUN_TYPES.find(t => t.id === form.type)?.label + ' Run',
      date: new Date(form.date).toISOString(),
      distanceM: dist * 1000,
      durationSeconds: dur,
      avgPacePerKm: dist > 0 && dur > 0 ? dur / dist : 0,
      elevationM: parseFloat(form.elevationM) || 0,
      hrAvg: parseInt(form.hrAvg) || 0,
      hrMax: parseInt(form.hrMax) || 0,
      notes: form.notes,
      source: 'manual',
    })
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-sunset-text">🏃 Log Run</h3>
          <button onClick={onClose} className="btn-ghost text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="input-label">Run Type</label>
            <div className="flex gap-2 flex-wrap">
              {RUN_TYPES.map(t => (
                <button key={t.id} onClick={() => set('type', t.id)}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={form.type === t.id
                    ? { background: t.color + '30', color: t.color, border: `1px solid ${t.color}60` }
                    : { background: 'rgba(255,255,255,0.05)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            {form.type && (
              <p className="text-sunset-muted text-xs mt-1">{RUN_TYPES.find(t => t.id === form.type)?.desc}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Distance (km)</label>
              <input type="number" step="0.1" placeholder="8.5" value={form.distanceKm} onChange={e => set('distanceKm', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Duration (min)</label>
              <input type="number" placeholder="45" value={form.durationMin} onChange={e => set('durationMin', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Elevation (m)</label>
              <input type="number" placeholder="120" value={form.elevationM} onChange={e => set('elevationM', e.target.value)} />
            </div>
          </div>

          {pacePerKm && (
            <div className="sunset-card p-3 text-center">
              <span className="label-sm">AVG PACE </span>
              <span className="text-sunset-orange font-black text-lg">{formatRunPace(pacePerKm)}/km</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Avg HR</label>
              <input type="number" placeholder="148" value={form.hrAvg} onChange={e => set('hrAvg', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Max HR</label>
              <input type="number" placeholder="172" value={form.hrMax} onChange={e => set('hrMax', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="input-label">Notes</label>
            <textarea rows={2} placeholder="Route, conditions, how it felt…" value={form.notes}
              onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <button className="btn-primary w-full mt-5" onClick={save}>Save Run</button>
      </div>
    </div>
  )
}

export default function RunTracker() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [stravaOk, setStravaOk] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const load = () => getRunSessions(30).then(setSessions)

  useEffect(() => {
    load()
    stravaConnected().then(setStravaOk)
  }, [])

  const syncStrava = async () => {
    setSyncing(true)
    try {
      const acts = await getRunActivities(20)
      for (const a of acts) {
        const existing = sessions.find(s => s.stravaId === a.id)
        if (!existing) await addRunSession(stravaActivityToRunSession(a))
      }
      load()
    } catch (e) {
      alert('Strava sync failed: ' + e.message)
    }
    setSyncing(false)
  }

  const weeklyKm = sessions
    .filter(s => new Date(s.date) >= new Date(Date.now() - 7 * 86400000))
    .reduce((sum, s) => sum + (s.distanceM || 0) / 1000, 0)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/train')} className="btn-ghost p-1">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-sunset-text">Running</h1>
          <p className="text-sunset-muted text-xs">Cross-training & aerobic base</p>
        </div>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-black text-sunset-text">{weeklyKm.toFixed(1)}</div>
          <div className="label-sm">km this week</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-black text-sunset-text">
            {sessions.filter(s => new Date(s.date) >= new Date(Date.now() - 7 * 86400000)).length}
          </div>
          <div className="label-sm">runs this week</div>
        </Card>
      </div>

      {/* Strava Sync */}
      {stravaOk && (
        <button
          className="btn-secondary w-full flex items-center justify-center gap-2"
          onClick={syncStrava}
          disabled={syncing}
        >
          <ExternalLink size={14} />
          {syncing ? 'Syncing from Strava…' : 'Sync from Strava'}
        </button>
      )}

      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Run
        </button>
        {!stravaOk && (
          <button className="btn-secondary flex-1 text-sm" onClick={() => navigate('/settings')}>
            Connect Strava
          </button>
        )}
      </div>

      {/* Sessions */}
      <div>
        <p className="label-sm mb-2">RECENT RUNS</p>
        {sessions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-4xl mb-2">🏃</p>
            <p className="text-sunset-muted text-sm">No runs logged. Cross-training builds your aerobic engine.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => {
              const runType = RUN_TYPES.find(t => t.id === s.type)
              return (
                <Card key={s.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: (runType?.color || '#45B7D1') + '20' }}>
                        <span className="text-lg">🏃</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sunset-text text-sm font-bold">{s.name || 'Run'}</p>
                          {runType && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ background: runType.color + '25', color: runType.color }}>
                              {runType.label}
                            </span>
                          )}
                          {s.source === 'strava' && (
                            <span className="text-xs text-[#FC4C02]">⚡ Strava</span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-sunset-muted text-xs">
                            {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          {s.distanceM > 0 && (
                            <span className="text-sunset-amber text-xs font-semibold">
                              {(s.distanceM / 1000).toFixed(1)}km
                            </span>
                          )}
                          {s.avgPacePerKm > 0 && (
                            <span className="text-sunset-gold text-xs">{formatRunPace(s.avgPacePerKm)}/km</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {s.hrAvg > 0 && <span className="text-xs text-sunset-coral">❤️ {s.hrAvg}</span>}
                      <button onClick={async () => { await db.runSessions.delete(s.id); load() }}
                        className="text-sunset-muted hover:text-sunset-coral p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {s.notes && <p className="text-sunset-muted text-xs mt-2 italic">"{s.notes}"</p>}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <LogModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, ChevronDown, Trash2, Zap, Clock, Activity } from 'lucide-react'
import { useApp } from '../App.jsx'
import { addErgSession, getErgSessions, db } from '../utils/db.js'
import {
  ERG_SESSION_TYPES, formatPace, paceToWatts, parsePace, ZONES,
  getZoneFromPace, ergTimeToSeconds, formatTime2k,
} from '../utils/training.js'
import Card from './common/Card.jsx'
import ZoneBadge from './common/ZoneBadge.jsx'

function SplitRow({ index, split, onChange, base2kSecs }) {
  const zone = base2kSecs ? getZoneFromPace(parsePace(split.pace) || 999, base2kSecs) : 'UT1'
  const watts = parsePace(split.pace) ? paceToWatts(parsePace(split.pace)) : 0
  return (
    <div className="flex items-center gap-2 py-2 border-b border-white/5">
      <span className="text-sunset-muted text-xs w-14 shrink-0">
        {index * 500}–{(index + 1) * 500}m
      </span>
      <input
        className="flex-1 text-sm"
        placeholder="1:55.0"
        value={split.pace}
        onChange={e => onChange({ ...split, pace: e.target.value })}
      />
      <div className="flex items-center gap-1 w-20 shrink-0 justify-end">
        {watts > 0 && <span className="text-sunset-amber text-xs font-bold">{watts}W</span>}
        <ZoneBadge zone={zone} />
      </div>
    </div>
  )
}

function LogModal({ sessionType, onClose, onSaved, base2kSecs }) {
  const type = ERG_SESSION_TYPES.find(t => t.id === sessionType) || ERG_SESSION_TYPES[8]
  const splitCount = sessionType === '2k' ? 4 : sessionType === '6k' ? 12 : 8

  const [splits, setSplits] = useState(
    Array.from({ length: splitCount }, () => ({ pace: '' }))
  )
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hrAvg: '', hrMax: '', rpe: '7',
    strokeRate: '', notes: '', erg2kTime: '',
    distanceM: sessionType === '2k' ? 2000 : sessionType === '6k' ? 6000 : 0,
    customSplits: splitCount,
  })

  const updateSplit = (i, val) => setSplits(prev => prev.map((s, j) => j === i ? val : s))

  const validSplits = splits.map(s => parsePace(s.pace)).filter(Boolean)
  const avgSplit = validSplits.length ? validSplits.reduce((a, b) => a + b, 0) / validSplits.length : null
  const avgWatts = avgSplit ? paceToWatts(avgSplit) : 0
  const totalTime = validSplits.length === splits.length
    ? validSplits.reduce((a, b) => a + b, 0) * (500 / 500)
    : null

  const computedTotalTime = avgSplit && form.distanceM
    ? avgSplit * (form.distanceM / 500)
    : null

  const save = async () => {
    const session = {
      type: sessionType,
      name: type.label,
      date: new Date(form.date).toISOString(),
      distanceM: parseInt(form.distanceM) || 0,
      splits: splits.map(s => ({ pace: s.pace, paceSeconds: parsePace(s.pace), watts: parsePace(s.pace) ? paceToWatts(parsePace(s.pace)) : 0 })),
      avgSplitSeconds: avgSplit,
      avgWatts,
      totalTimeSeconds: computedTotalTime,
      hrAvg: parseInt(form.hrAvg) || 0,
      hrMax: parseInt(form.hrMax) || 0,
      rpe: parseInt(form.rpe) || 0,
      strokeRate: parseInt(form.strokeRate) || 0,
      notes: form.notes,
      erg2kTime: sessionType === '2k' && computedTotalTime ? formatTime2k(computedTotalTime) : form.erg2kTime,
    }
    await addErgSession(session)
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-sunset-text">{type.icon} {type.label}</h3>
            <p className="text-sunset-muted text-xs">{type.desc}</p>
          </div>
          <button onClick={onClose} className="btn-ghost text-xl">✕</button>
        </div>

        {/* Date & distance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="input-label">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Distance (m)</label>
            <input type="number" value={form.distanceM} onChange={e => setForm(f => ({ ...f, distanceM: e.target.value }))} />
          </div>
        </div>

        {/* Splits */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="label-sm">500M SPLITS (pace per 500m)</p>
            {avgSplit && (
              <span className="text-sunset-orange text-xs font-bold">{formatPace(avgSplit)} avg · {avgWatts}W</span>
            )}
          </div>
          <div className="sunset-card p-2">
            {splits.map((split, i) => (
              <SplitRow key={i} index={i} split={split} onChange={v => updateSplit(i, v)} base2kSecs={base2kSecs} />
            ))}
          </div>
          {computedTotalTime && (
            <div className="mt-2 text-center">
              <span className="text-sunset-muted text-xs">Projected time: </span>
              <span className="text-sunset-orange font-bold">{formatTime2k(computedTotalTime)}</span>
            </div>
          )}
        </div>

        {/* HR & RPE */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="input-label">Avg HR</label>
            <input type="number" placeholder="155" value={form.hrAvg} onChange={e => setForm(f => ({ ...f, hrAvg: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Max HR</label>
            <input type="number" placeholder="185" value={form.hrMax} onChange={e => setForm(f => ({ ...f, hrMax: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">SR (spm)</label>
            <input type="number" placeholder="24" value={form.strokeRate} onChange={e => setForm(f => ({ ...f, strokeRate: e.target.value }))} />
          </div>
        </div>

        <div className="mb-4">
          <label className="input-label">RPE (1–10) · Current: {form.rpe}</label>
          <input type="range" min="1" max="10" value={form.rpe}
            onChange={e => setForm(f => ({ ...f, rpe: e.target.value }))}
            className="w-full accent-sunset-orange" />
          <div className="flex justify-between text-sunset-muted text-xs mt-1">
            <span>Very easy</span><span>Max effort</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="input-label">Notes</label>
          <textarea rows={2} placeholder="How did it feel? Any technique cues..." value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <button className="btn-primary w-full" onClick={save}>
          <Zap size={16} /> Save Session
        </button>
      </div>
    </div>
  )
}

export default function ErgTracker() {
  const { profile } = useApp()
  const [sessions, setSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedType, setSelectedType] = useState('2k')

  const base2kSecs = ergTimeToSeconds(profile.currentErg2k)

  const load = () => getErgSessions(50).then(setSessions)
  useEffect(() => { load() }, [])

  const best2k = sessions.find(s => s.type === '2k' && s.erg2kTime)
  const recentSplits = sessions.slice(0, 5).map(s => ({
    date: s.date, split: s.avgSplitSeconds, watts: s.avgWatts, type: s.type
  }))

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return
    await db.ergSessions.delete(id)
    load()
  }

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-sunset-text">Erg Tracker</h1>
          <p className="text-sunset-muted text-xs">Goal: {profile.currentErg2k} → {profile.targetErg2k}</p>
        </div>
        <button
          className="btn-primary px-4 py-2 text-sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Log
        </button>
      </div>

      {/* Session Type Picker */}
      <div>
        <p className="label-sm mb-2">SESSION TYPE</p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {ERG_SESSION_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={selectedType === t.id
                ? { background: 'rgba(255,107,53,0.3)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.5)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Best 2k */}
      {best2k && (
        <Card glow className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-sm">BEST 2K THIS BLOCK</p>
              <p className="metric-big mt-1">{best2k.erg2kTime}</p>
              <p className="text-sunset-muted text-xs mt-1">
                {new Date(best2k.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                {best2k.avgWatts ? ` · ${best2k.avgWatts}W avg` : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sunset-orange text-4xl">🏆</div>
              {profile.targetErg2k && (
                <p className="text-sunset-muted text-xs mt-1">Target: {profile.targetErg2k}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Training Zone Reference */}
      {base2kSecs && (
        <div>
          <p className="label-sm mb-2">TRAINING ZONES (your paces)</p>
          <div className="space-y-1">
            {Object.values(ZONES).reverse().map(z => {
              const splitSecs = base2kSecs / 4 + z.paceOffset
              return (
                <div key={z.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                  style={{ background: z.color + '15', border: `1px solid ${z.color}30` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: z.color }}>{z.label}</span>
                    <span className="text-sunset-muted text-xs">{z.name}</span>
                  </div>
                  <span className="text-sunset-text text-xs font-semibold">
                    {formatPace(splitSecs)}/500m · {paceToWatts(splitSecs)}W
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <p className="label-sm mb-2">RECENT SESSIONS ({sessions.length})</p>
        {sessions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-4xl mb-2">🚣</p>
            <p className="text-sunset-muted">No sessions yet. Get on the erg.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,107,53,0.15)' }}>
                      <Activity size={16} className="text-sunset-orange" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sunset-text text-sm font-bold">{s.name || s.type}</p>
                        {s.type === '2k' && s.erg2kTime && (
                          <span className="text-sunset-orange text-xs font-black">{s.erg2kTime}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sunset-muted text-xs">
                          {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        {s.avgSplitSeconds && (
                          <span className="text-sunset-amber text-xs">{formatPace(s.avgSplitSeconds)}/500</span>
                        )}
                        {s.avgWatts > 0 && (
                          <span className="text-sunset-gold text-xs">{s.avgWatts}W</span>
                        )}
                        {s.rpe > 0 && (
                          <span className="text-sunset-muted text-xs">RPE {s.rpe}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.hrAvg > 0 && (
                      <span className="text-xs text-sunset-coral">❤️ {s.hrAvg}</span>
                    )}
                    <button onClick={() => deleteSession(s.id)} className="text-sunset-muted hover:text-sunset-coral p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {s.notes && <p className="text-sunset-muted text-xs mt-2 italic">"{s.notes}"</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <LogModal
          sessionType={selectedType}
          base2kSecs={base2kSecs}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

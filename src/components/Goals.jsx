import { useState, useEffect } from 'react'
import { Plus, Check, Target, Apple, Moon, Droplets } from 'lucide-react'
import { useApp } from '../App.jsx'
import { getTodayCheckin, saveDailyCheckin, getCheckinHistory } from '../utils/db.js'
import Card from './common/Card.jsx'
import ProgressRing from './common/ProgressRing.jsx'

const NUTRITION_TARGETS = {
  calories: { label: 'Calories', unit: 'kcal', default: 3200 },
  protein:  { label: 'Protein',  unit: 'g',    default: 180  },
  carbs:    { label: 'Carbs',    unit: 'g',    default: 420  },
  fats:     { label: 'Fats',     unit: 'g',    default: 85   },
  hydration:{ label: 'Water',    unit: 'L',    default: 3.5  },
}

function Macro({ label, current, target, unit, color }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div className="text-center">
      <ProgressRing percent={pct} size={68} stroke={6} color={color} />
      <p className="text-sunset-text text-xs font-bold mt-1">{current || 0}{unit}</p>
      <p className="label-sm">{label}</p>
      <p className="text-sunset-muted text-xs">/ {target}{unit}</p>
    </div>
  )
}

export default function Goals() {
  const { profile } = useApp()
  const [checkin, setCheckin] = useState(null)
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('daily')
  const [goals, setGoals] = useState({
    calories: 3200, protein: 180, carbs: 420, fats: 85, hydration: 3.5
  })
  const [today, setToday] = useState({
    weight: '', hrv: '', sleepHours: '', sleepQuality: '4',
    mood: '4', fatigue: '3', readiness: '4',
    calories: '', protein: '', carbs: '', fats: '', hydration: '',
    notes: '',
  })

  useEffect(() => {
    getTodayCheckin().then(ci => {
      if (ci) setToday(prev => ({ ...prev, ...ci }))
      setCheckin(ci)
    })
    getCheckinHistory(14).then(setHistory)
  }, [])

  const set = (k, v) => setToday(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    await saveDailyCheckin({ ...today })
    alert('Daily check-in saved!')
  }

  const readinessScore = (() => {
    const hrv = parseFloat(today.hrv)
    const sleep = parseFloat(today.sleepHours)
    const fatigue = parseInt(today.fatigue)
    if (!hrv && !sleep) return null
    let score = 5
    if (sleep >= 8) score += 2; else if (sleep >= 7) score += 1; else if (sleep < 6) score -= 2
    if (fatigue <= 3) score += 1; else if (fatigue >= 7) score -= 2
    return Math.min(10, Math.max(1, score))
  })()

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-black text-sunset-text">Goals & Check-in</h1>
        <p className="text-sunset-muted text-xs">Daily readiness, nutrition & fitness targets</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['daily', 'nutrition', 'fitness'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
            style={tab === t
              ? { background: 'rgba(255,107,53,0.25)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {t === 'daily' ? '📋 Daily' : t === 'nutrition' ? '🍎 Fuel' : '🎯 Fitness'}
          </button>
        ))}
      </div>

      {/* Daily Check-in Tab */}
      {tab === 'daily' && (
        <div className="space-y-4">
          {readinessScore !== null && (
            <Card glow className="p-4 flex items-center justify-between">
              <div>
                <p className="label-sm">READINESS SCORE</p>
                <p className="text-4xl font-black mt-1"
                  style={{ color: readinessScore >= 7 ? '#FDB931' : readinessScore >= 5 ? '#FF6B35' : '#FF4757' }}>
                  {readinessScore}/10
                </p>
                <p className="text-sunset-muted text-xs mt-1">
                  {readinessScore >= 7 ? 'Go hard today 🔥' : readinessScore >= 5 ? 'Moderate session ⚡' : 'Recovery day 🌊'}
                </p>
              </div>
              <div className="text-5xl">
                {readinessScore >= 8 ? '🟢' : readinessScore >= 5 ? '🟡' : '🔴'}
              </div>
            </Card>
          )}

          <Card className="p-4 space-y-3">
            <p className="section-title flex items-center gap-2"><Moon size={16} className="text-sunset-pink" /> Sleep & Recovery</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Weight (kg)</label>
                <input type="number" step="0.1" placeholder="72.5" value={today.weight} onChange={e => set('weight', e.target.value)} />
              </div>
              <div>
                <label className="input-label">HRV (ms)</label>
                <input type="number" placeholder="65" value={today.hrv} onChange={e => set('hrv', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Sleep hours</label>
                <input type="number" step="0.5" placeholder="8.0" value={today.sleepHours} onChange={e => set('sleepHours', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Sleep quality (1–5): {today.sleepQuality}</label>
                <input type="range" min="1" max="5" value={today.sleepQuality}
                  onChange={e => set('sleepQuality', e.target.value)} className="accent-sunset-pink" />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <p className="section-title">Mental State</p>
            <div>
              <label className="input-label">Mood (1–10): {today.mood}</label>
              <input type="range" min="1" max="10" value={today.mood}
                onChange={e => set('mood', e.target.value)} className="accent-sunset-gold" />
              <div className="flex justify-between text-xs text-sunset-muted mt-1">
                <span>😔 Low</span><span>😎 High</span>
              </div>
            </div>
            <div>
              <label className="input-label">Fatigue (1–10): {today.fatigue}</label>
              <input type="range" min="1" max="10" value={today.fatigue}
                onChange={e => set('fatigue', e.target.value)} className="accent-sunset-coral" />
              <div className="flex justify-between text-xs text-sunset-muted mt-1">
                <span>💪 Fresh</span><span>😴 Exhausted</span>
              </div>
            </div>
            <div>
              <label className="input-label">Notes</label>
              <textarea rows={2} placeholder="How are you feeling today?" value={today.notes}
                onChange={e => set('notes', e.target.value)} />
            </div>
          </Card>

          <button className="btn-primary w-full" onClick={save}>
            <Check size={16} /> Save Check-in
          </button>
        </div>
      )}

      {/* Nutrition Tab */}
      {tab === 'nutrition' && (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="section-title flex items-center gap-2 mb-4"><Apple size={16} className="text-[#7EC8E3]" /> Today's Fuel</p>
            <div className="flex justify-around">
              <Macro label="Calories" current={today.calories} target={goals.calories} unit="kcal" color="#FF6B35" />
              <Macro label="Protein"  current={today.protein}  target={goals.protein}  unit="g"    color="#FDB931" />
              <Macro label="Carbs"    current={today.carbs}    target={goals.carbs}    unit="g"    color="#45B7D1" />
              <Macro label="Fats"     current={today.fats}     target={goals.fats}     unit="g"    color="#FF6B9D" />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <p className="label-sm">LOG TODAY'S INTAKE</p>
            {Object.entries(NUTRITION_TARGETS).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-sunset-muted text-xs w-16 shrink-0">{meta.label}</label>
                <input type="number" placeholder={String(meta.default)}
                  value={today[key] || ''} onChange={e => set(key, e.target.value)} />
                <span className="text-sunset-muted text-xs shrink-0">{meta.unit}</span>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <p className="label-sm">DAILY TARGETS</p>
            {Object.entries(NUTRITION_TARGETS).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-sunset-text text-xs w-16 shrink-0">{meta.label}</label>
                <input type="number" value={goals[key] || meta.default}
                  onChange={e => setGoals(g => ({ ...g, [key]: parseFloat(e.target.value) }))} />
                <span className="text-sunset-muted text-xs shrink-0">{meta.unit}</span>
              </div>
            ))}
          </Card>

          <div className="sunset-card p-3 text-xs text-sunset-muted leading-relaxed">
            <p className="font-semibold text-sunset-peach mb-1">Elite Rowing Fuel Guide</p>
            <p>• Pre-session (2h): 60–80g carbs + 20g protein</p>
            <p>• During 90min+: 30–60g carbs/hr via gels or sports drink</p>
            <p>• Post-session (30min): 40g protein + 80g carbs for glycogen reload</p>
            <p>• Target 1.6–2.2g protein/kg bodyweight per day</p>
          </div>

          <button className="btn-primary w-full" onClick={save}>
            <Check size={16} /> Save Today's Fuel
          </button>
        </div>
      )}

      {/* Fitness Goals Tab */}
      {tab === 'fitness' && (
        <div className="space-y-4">
          <Card glow className="p-4">
            <p className="label-sm mb-3">PRIMARY GOAL — 2K ERG</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sunset-muted text-xs">Start</p>
                <p className="text-lg font-black text-sunset-text">{profile.startErg2k || profile.currentErg2k || '--:--'}</p>
              </div>
              <div className="text-2xl text-sunset-muted">→</div>
              <div className="text-right">
                <p className="text-sunset-muted text-xs">Target</p>
                <p className="text-lg font-black text-sunset-orange">{profile.targetErg2k || '--:--'}</p>
              </div>
            </div>
            {profile.targetDate && (
              <p className="text-sunset-muted text-xs mt-2">
                🎯 Deadline: {new Date(profile.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <p className="section-title">Training Volume Targets</p>
            {[
              { label: 'Weekly erg km', target: '80km', desc: 'Holiday block baseline' },
              { label: 'Weekly run', target: '2–3 runs', desc: 'Aerobic cross-training' },
              { label: 'Gym sessions', target: '2×/week', desc: 'Strength & power' },
              { label: 'UT2/UT1 split', target: '80%', desc: 'Polarized training model' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sunset-text text-sm font-semibold">{item.label}</p>
                  <p className="text-sunset-muted text-xs">{item.desc}</p>
                </div>
                <span className="text-sunset-orange font-bold text-sm">{item.target}</span>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <p className="section-title">Strength Benchmarks</p>
            {[
              { label: 'Deadlift', target: '2× body weight', why: 'Drive power baseline' },
              { label: 'Back Squat', target: '1.5× body weight', why: 'Leg drive strength' },
              { label: 'Barbell Row', target: '1.25× body weight', why: 'Pull strength / catch' },
              { label: 'Power Clean', target: '1× body weight', why: 'Explosive power' },
              { label: 'Plank hold', target: '3 minutes', why: 'Core stability' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sunset-text text-sm font-semibold">{item.label}</p>
                  <p className="text-sunset-muted text-xs">{item.why}</p>
                </div>
                <span className="text-sunset-gold font-bold text-xs">{item.target}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addGymSession, getGymSessions, db } from '../utils/db.js'
import { GYM_TEMPLATES } from '../utils/training.js'
import Card from './common/Card.jsx'

const ROWING_EXERCISES = [
  'Power Clean', 'Hang Clean', 'Box Jumps', 'Romanian Deadlift', 'Back Squat',
  'Front Squat', 'Barbell Row', 'Bench Press', 'Deadlift', 'Pull-ups',
  'Chin-ups', 'Hip Bridges', 'Bulgarian Split Squat', 'Nordic Hamstrings',
  'Plank Hold', 'Side Plank', 'Hanging Knee Raise', 'Cable Row', 'Lat Pulldown',
  'Dumbbell Row', 'Shoulder Press', 'Hip Flexor Stretch', 'Pigeon Pose', 'Good Mornings',
]

function SetRow({ set, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input className="w-16 text-sm" type="number" placeholder="kg" value={set.weight}
        onChange={e => onChange({ ...set, weight: e.target.value })} />
      <span className="text-sunset-muted text-xs">×</span>
      <input className="w-16 text-sm" type="number" placeholder="reps" value={set.reps}
        onChange={e => onChange({ ...set, reps: e.target.value })} />
      <button onClick={onRemove} className="text-sunset-muted text-xs ml-auto">✕</button>
    </div>
  )
}

function ExerciseBlock({ exercise, onChange, onRemove }) {
  const addSet = () => onChange({ ...exercise, sets: [...exercise.sets, { weight: '', reps: '' }] })
  const updateSet = (i, s) => onChange({ ...exercise, sets: exercise.sets.map((x, j) => j === i ? s : x) })
  const removeSet = (i) => onChange({ ...exercise, sets: exercise.sets.filter((_, j) => j !== i) })

  return (
    <div className="sunset-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sunset-text font-semibold text-sm">{exercise.name}</span>
        <button onClick={onRemove} className="text-sunset-muted hover:text-sunset-coral">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex text-xs text-sunset-muted gap-4 mb-1 px-1">
        <span className="w-16">Weight</span>
        <span>Reps</span>
      </div>
      {exercise.sets.map((set, i) => (
        <SetRow key={i} set={set} onChange={s => updateSet(i, s)} onRemove={() => removeSet(i)} />
      ))}
      <button className="mt-2 text-xs text-sunset-orange font-semibold" onClick={addSet}>
        + Add set
      </button>
    </div>
  )
}

function LogModal({ template, onClose, onSaved }) {
  const tmpl = GYM_TEMPLATES[template]
  const [exercises, setExercises] = useState(
    (tmpl?.exercises || []).map(name => ({ name, sets: [{ weight: '', reps: '' }] }))
  )
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    duration: '60', rpe: '7', notes: '', type: template,
  })
  const [customEx, setCustomEx] = useState('')

  const addExercise = (name) => {
    if (!name.trim()) return
    setExercises(prev => [...prev, { name: name.trim(), sets: [{ weight: '', reps: '' }] }])
    setCustomEx('')
  }

  const save = async () => {
    const session = {
      type: form.type,
      name: tmpl?.name || 'Gym Session',
      date: new Date(form.date).toISOString(),
      durationSeconds: parseInt(form.duration) * 60 || 0,
      exercises,
      rpe: parseInt(form.rpe) || 0,
      notes: form.notes,
    }
    await addGymSession(session)
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-sunset-text">
              {tmpl?.icon} {tmpl?.name || 'Gym Session'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="input-label">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Duration (min)</label>
            <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
          </div>
        </div>

        <div className="mb-4">
          {exercises.map((ex, i) => (
            <ExerciseBlock
              key={i} exercise={ex}
              onChange={v => setExercises(prev => prev.map((e, j) => j === i ? v : e))}
              onRemove={() => setExercises(prev => prev.filter((_, j) => j !== i))}
            />
          ))}
          <div className="flex gap-2">
            <select className="flex-1 text-sm" value={customEx} onChange={e => setCustomEx(e.target.value)}>
              <option value="">Add exercise…</option>
              {ROWING_EXERCISES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button className="btn-secondary px-3 text-sm" onClick={() => addExercise(customEx)}>Add</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="input-label">RPE (1–10) · {form.rpe}</label>
          <input type="range" min="1" max="10" value={form.rpe}
            onChange={e => setForm(f => ({ ...f, rpe: e.target.value }))}
            className="w-full accent-sunset-orange" />
        </div>

        <div className="mb-5">
          <label className="input-label">Notes</label>
          <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <button className="btn-primary w-full" onClick={save}>Save Session</button>
      </div>
    </div>
  )
}

export default function GymTracker() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState('strength')

  const load = () => getGymSessions(30).then(setSessions)
  useEffect(() => { load() }, [])

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/train')} className="btn-ghost p-1">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-sunset-text">Gym</h1>
          <p className="text-sunset-muted text-xs">Rowing-specific strength & power</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <p className="label-sm mb-2">CHOOSE TEMPLATE</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(GYM_TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setActiveTemplate(key)}
              className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all"
              style={activeTemplate === key
                ? { background: t.color + '25', border: `1px solid ${t.color}60` }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-bold" style={{ color: activeTemplate === key ? t.color : '#B8A9C0' }}>
                {t.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-sm mb-2">
          {GYM_TEMPLATES[activeTemplate]?.icon} {GYM_TEMPLATES[activeTemplate]?.name} EXERCISES
        </p>
        <Card className="p-3">
          {GYM_TEMPLATES[activeTemplate]?.exercises.map(ex => (
            <div key={ex} className="py-1.5 border-b border-white/5 last:border-0 text-sm text-sunset-text">{ex}</div>
          ))}
        </Card>
      </div>

      <button className="btn-primary w-full" onClick={() => setShowModal(true)}>
        <Plus size={16} /> Log {GYM_TEMPLATES[activeTemplate]?.name}
      </button>

      {/* History */}
      <div>
        <p className="label-sm mb-2">RECENT GYM SESSIONS</p>
        {sessions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-4xl mb-2">💪</p>
            <p className="text-sunset-muted text-sm">No gym sessions logged yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sunset-text font-semibold text-sm">{s.name}</p>
                    <p className="text-sunset-muted text-xs">
                      {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {s.durationSeconds ? ` · ${Math.round(s.durationSeconds / 60)}min` : ''}
                      {s.rpe ? ` · RPE ${s.rpe}` : ''}
                    </p>
                  </div>
                  <button onClick={async () => { await db.gymSessions.delete(s.id); load() }}
                    className="text-sunset-muted hover:text-sunset-coral p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                {s.exercises?.length > 0 && (
                  <p className="text-sunset-muted text-xs mt-1">
                    {s.exercises.map(e => e.name).join(' · ')}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <LogModal
          template={activeTemplate}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

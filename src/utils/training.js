// ─── Pace / Watts conversion (Concept2 calibrated) ───────────────────────────

const K = 366336000  // calibration constant: at 2:00/500m → ~212W

export function paceToWatts(paceSeconds) {
  if (!paceSeconds || paceSeconds <= 0) return 0
  return Math.round(K / Math.pow(paceSeconds, 3))
}

export function wattsToPace(watts) {
  if (!watts || watts <= 0) return 0
  return Math.round(Math.cbrt(K / watts))
}

// ─── Time / Pace formatting ───────────────────────────────────────────────────

export function formatPace(totalSeconds) {
  if (!totalSeconds) return '--:--'
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  const tenths = Math.round((totalSeconds % 1) * 10)
  return `${mins}:${String(secs).padStart(2, '0')}.${tenths}`
}

export function formatPaceShort(totalSeconds) {
  if (!totalSeconds) return '--:--'
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function parsePace(str) {
  // Accepts "1:55.3", "1:55", "115.3"
  if (!str) return null
  const clean = String(str).trim()
  const match = clean.match(/^(\d+):(\d{2})(?:\.(\d))?$/)
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]) + (match[3] ? parseInt(match[3]) / 10 : 0)
  }
  const secs = parseFloat(clean)
  return isNaN(secs) ? null : secs
}

export function formatTime2k(totalSeconds) {
  if (!totalSeconds) return '--:--.-'
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  const tenths = Math.round((totalSeconds % 1) * 10)
  return `${mins}:${String(secs).padStart(2, '0')}.${tenths}`
}

export function ergTimeToSeconds(str) {
  // "6:45.2" → 405.2
  if (!str) return null
  const match = String(str).match(/^(\d+):(\d{2})(?:\.(\d))?$/)
  if (!match) return null
  return parseInt(match[1]) * 60 + parseInt(match[2]) + (match[3] ? parseInt(match[3]) / 10 : 0)
}

export function formatRunPace(secsPerKm) {
  if (!secsPerKm) return '--:--'
  const mins = Math.floor(secsPerKm / 60)
  const secs = Math.round(secsPerKm % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// ─── Training Zones (rowing, % of 2k pace) ───────────────────────────────────

export const ZONES = {
  UT2: { label: 'UT2', name: 'Recovery',   color: '#7EC8E3', hr: [0, 70],    paceOffset: 30 },
  UT1: { label: 'UT1', name: 'Aerobic',    color: '#45B7D1', hr: [70, 80],   paceOffset: 18 },
  AT:  { label: 'AT',  name: 'Threshold',  color: '#FDB931', hr: [80, 87],   paceOffset: 10 },
  TR:  { label: 'TR',  name: 'Transport',  color: '#FF6B35', hr: [87, 94],   paceOffset: 4  },
  AN:  { label: 'AN',  name: 'Anaerobic',  color: '#FF4757', hr: [94, 100],  paceOffset: 0  },
}

export function getZoneFromHR(hrPercent) {
  if (hrPercent >= 94) return 'AN'
  if (hrPercent >= 87) return 'TR'
  if (hrPercent >= 80) return 'AT'
  if (hrPercent >= 70) return 'UT1'
  return 'UT2'
}

export function getZoneFromPace(paceSeconds, base2kSeconds) {
  if (!base2kSeconds) return 'UT1'
  const split2k = base2kSeconds / 4  // 2k time → 500m split
  const offset = paceSeconds - split2k
  if (offset <= 4)  return 'AN'
  if (offset <= 8)  return 'TR'
  if (offset <= 14) return 'AT'
  if (offset <= 24) return 'UT1'
  return 'UT2'
}

// ─── Session Types ────────────────────────────────────────────────────────────

export const ERG_SESSION_TYPES = [
  { id: '2k',      label: '2k Test',       icon: '🏆', desc: 'Full race simulation' },
  { id: '6k',      label: '6k Test',       icon: '⚡', desc: 'Threshold benchmark' },
  { id: '30min',   label: '30\' Steady',   icon: '🌊', desc: 'Aerobic base (UT1)' },
  { id: '60min',   label: '60\' Row',      icon: '🌅', desc: 'Long aerobic (UT2/UT1)' },
  { id: '4x1k',    label: '4 × 1k',        icon: '🔥', desc: 'VO2 max intervals' },
  { id: '8x500',   label: '8 × 500m',      icon: '💥', desc: 'AT threshold work' },
  { id: '10x500',  label: '10 × 500m',     icon: '⚔️',  desc: 'High volume AT' },
  { id: '6x2k',    label: '6 × 2k',        icon: '🏋️',  desc: 'Threshold pieces' },
  { id: 'custom',  label: 'Custom',        icon: '✏️',  desc: 'Define your own' },
]

export const GYM_TEMPLATES = {
  power: {
    name: 'Power Day',
    icon: '⚡',
    color: '#FF6B35',
    exercises: ['Power Clean', 'Box Jumps', 'Romanian Deadlift', 'Pull-ups', 'Core Circuit'],
  },
  strength: {
    name: 'Strength Day',
    icon: '💪',
    color: '#FDB931',
    exercises: ['Back Squat', 'Barbell Row', 'Bench Press', 'Deadlift', 'Hip Flexor Stretch'],
  },
  core: {
    name: 'Core & Flexibility',
    icon: '🧘',
    color: '#45B7D1',
    exercises: ['Plank Hold', 'Hanging Knee Raise', 'Side Plank', 'Hip Bridges', 'Pigeon Pose'],
  },
}

export const RUN_TYPES = [
  { id: 'easy',       label: 'Easy',       color: '#7EC8E3', desc: 'Active recovery, conversational pace' },
  { id: 'tempo',      label: 'Tempo',      color: '#FDB931', desc: 'Comfortably hard, AT pace' },
  { id: 'intervals',  label: 'Intervals',  color: '#FF6B35', desc: 'Hard efforts, full recovery' },
  { id: 'long',       label: 'Long Run',   color: '#45B7D1', desc: 'Easy pace, aerobic base' },
  { id: 'recovery',   label: 'Recovery',   color: '#B8A9C0', desc: 'Very easy jog or walk' },
]

// ─── Training Load (CTL / ATL / Form) ─────────────────────────────────────────

export function estimateSessionTSS(session) {
  // Simplified TSS: (duration_min * intensity_factor^2) / 60 * 100
  const durationMin = (session.durationSeconds || 0) / 60
  const rpe = session.rpe || 5
  const if_ = 0.4 + (rpe / 10) * 0.7  // rough IF from RPE (0.4–1.1)
  return Math.round(durationMin * Math.pow(if_, 2) * 100 / 60)
}

export function calcTrainingLoad(sessions, days = 90) {
  const now = Date.now()
  const dayMs = 86400000
  const result = []

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - i * dayMs
    const dayEnd = dayStart + dayMs
    const daySessions = sessions.filter(s => {
      const t = new Date(s.date).getTime()
      return t >= dayStart && t < dayEnd
    })
    const dailyTSS = daySessions.reduce((sum, s) => sum + estimateSessionTSS(s), 0)
    result.push({ date: new Date(dayStart).toISOString().slice(0, 10), tss: dailyTSS })
  }

  // Compute CTL (42-day) and ATL (7-day) EMA
  let ctl = 0, atl = 0
  const ctlDecay = 2 / (42 + 1)
  const atlDecay = 2 / (7 + 1)

  return result.map(day => {
    ctl = day.tss * ctlDecay + ctl * (1 - ctlDecay)
    atl = day.tss * atlDecay + atl * (1 - atlDecay)
    const form = ctl - atl
    return {
      date: day.date,
      tss: day.tss,
      ctl: Math.round(ctl),
      atl: Math.round(atl),
      form: Math.round(form),
    }
  })
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

export function calcStreaks(sessions) {
  if (!sessions.length) return { current: 0, longest: 0 }
  const days = new Set(sessions.map(s => new Date(s.date).toDateString()))
  const sorted = Array.from(days).map(d => new Date(d)).sort((a, b) => b - a)

  let current = 0, longest = 0, streak = 1
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (sorted[0].toDateString() !== today && sorted[0].toDateString() !== yesterday) {
    current = 0
  } else {
    current = 1
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i - 1] - sorted[i]) / 86400000
      if (Math.round(diff) === 1) { current++; streak++ }
      else { longest = Math.max(longest, streak); streak = 1; break }
    }
  }
  return { current, longest: Math.max(longest, current) }
}

// ─── Erg Score Progress ───────────────────────────────────────────────────────

export function ergProgressPercent(currentStr, targetStr, startStr) {
  const current = ergTimeToSeconds(currentStr)
  const target  = ergTimeToSeconds(targetStr)
  const start   = ergTimeToSeconds(startStr)
  if (!current || !target || !start) return 0
  if (start <= target) return 100
  return Math.min(100, Math.max(0, Math.round(((start - current) / (start - target)) * 100)))
}

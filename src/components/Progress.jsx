import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from 'recharts'
import { Settings, Sparkles } from 'lucide-react'
import { useApp } from '../App.jsx'
import { getAllSessions, getCheckinHistory } from '../utils/db.js'
import { calcTrainingLoad, calcStreaks, ergTimeToSeconds, ZONES, paceToWatts, formatPace } from '../utils/training.js'
import Card from './common/Card.jsx'
import ProgressRing from './common/ProgressRing.jsx'

const tooltipStyle = {
  backgroundColor: '#2D2B55',
  border: '1px solid rgba(255,107,53,0.3)',
  borderRadius: 8,
  color: '#FFF5EE',
  fontSize: 11,
}

function ErgTrendChart({ sessions, targetErg }) {
  const data = sessions
    .filter(s => s.type === '2k' && s.erg2kTime)
    .slice(0, 12)
    .reverse()
    .map((s, i) => ({
      n: i + 1,
      date: new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      secs: ergTimeToSeconds(s.erg2kTime),
      time: s.erg2kTime,
    }))

  const targetSecs = ergTimeToSeconds(targetErg)

  return (
    <Card className="p-4">
      <p className="label-sm mb-3">2K ERG TREND</p>
      {data.length < 2 ? (
        <p className="text-sunset-muted text-sm text-center py-6">Log 2+ test results to see your trend</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fill: '#B8A9C0', fontSize: 10 }} />
            <YAxis tick={{ fill: '#B8A9C0', fontSize: 10 }}
              tickFormatter={v => formatPace(v / 4)}
              domain={['dataMin - 5', 'dataMax + 5']}
              reversed />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v) => [formatPace(v / 4) + '/500m', '2k']} />
            {targetSecs && (
              <ReferenceLine y={targetSecs} stroke="#FDB931" strokeDasharray="4 2"
                label={{ value: 'Target', fill: '#FDB931', fontSize: 10, position: 'right' }} />
            )}
            <Line type="monotone" dataKey="secs" stroke="#FF6B35" strokeWidth={2.5}
              dot={{ fill: '#FF6B35', strokeWidth: 0, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

function TrainingLoadChart({ loadData }) {
  const recent = loadData.slice(-30)
  return (
    <Card className="p-4">
      <p className="label-sm mb-1">TRAINING LOAD (30 days)</p>
      <div className="flex gap-4 text-xs mb-3">
        <span style={{ color: '#45B7D1' }}>● Fitness (CTL)</span>
        <span style={{ color: '#FF4757' }}>● Fatigue (ATL)</span>
        <span style={{ color: '#FDB931' }}>● Form</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={recent} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
          <XAxis dataKey="date" tick={false} />
          <YAxis tick={{ fill: '#B8A9C0', fontSize: 9 }} />
          <Tooltip contentStyle={tooltipStyle}
            formatter={(v, n) => [Math.round(v), n]} />
          <Area type="monotone" dataKey="ctl" stroke="#45B7D1" fill="#45B7D120" strokeWidth={2} name="Fitness" />
          <Area type="monotone" dataKey="atl" stroke="#FF4757" fill="#FF475720" strokeWidth={2} name="Fatigue" />
          <Line type="monotone" dataKey="form" stroke="#FDB931" strokeWidth={1.5} dot={false} name="Form" />
        </AreaChart>
      </ResponsiveContainer>
      {recent.length > 0 && (
        <div className="flex justify-around mt-3 text-center">
          {[
            { label: 'Fitness', val: recent[recent.length-1]?.ctl, color: '#45B7D1' },
            { label: 'Fatigue', val: recent[recent.length-1]?.atl, color: '#FF4757' },
            { label: 'Form',    val: recent[recent.length-1]?.form, color: '#FDB931' },
          ].map(item => (
            <div key={item.label}>
              <p className="font-black text-lg" style={{ color: item.color }}>{item.val ?? '--'}</p>
              <p className="label-sm">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function VolumeByWeek({ allSessions }) {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(Date.now() - i * 7 * 86400000)
    const weekStart = new Date(weekEnd - 7 * 86400000)
    const label = `W${8 - i}`
    const ergKm = allSessions.erg
      .filter(s => { const d = new Date(s.date); return d >= weekStart && d < weekEnd })
      .reduce((sum, s) => sum + (s.distanceM || 0) / 1000, 0)
    const runKm = allSessions.run
      .filter(s => { const d = new Date(s.date); return d >= weekStart && d < weekEnd })
      .reduce((sum, s) => sum + (s.distanceM || 0) / 1000, 0)
    weeks.push({ label, erg: Math.round(ergKm), run: Math.round(runKm) })
  }
  return (
    <Card className="p-4">
      <p className="label-sm mb-3">WEEKLY VOLUME (km)</p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={weeks} margin={{ top: 0, right: 5, bottom: 0, left: -30 }}>
          <XAxis dataKey="label" tick={{ fill: '#B8A9C0', fontSize: 10 }} />
          <YAxis tick={{ fill: '#B8A9C0', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="erg" stackId="a" fill="#FF6B35" name="Erg (km)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="run" stackId="a" fill="#45B7D1" name="Run (km)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <span className="text-sunset-orange">■ Erg</span>
        <span className="text-[#45B7D1]">■ Run</span>
      </div>
    </Card>
  )
}

function ZoneDistribution({ ergSessions }) {
  const zoneCounts = { UT2: 0, UT1: 0, AT: 0, TR: 0, AN: 0 }
  ergSessions.forEach(s => {
    const z = s.zone || 'UT1'
    if (zoneCounts[z] !== undefined) zoneCounts[z] += (s.durationSeconds || 30 * 60)
  })
  const total = Object.values(zoneCounts).reduce((a, b) => a + b, 0)
  if (total === 0) return null
  const data = Object.entries(zoneCounts)
    .filter(([, v]) => v > 0)
    .map(([key, val]) => ({ name: key, value: val, pct: Math.round(val / total * 100), color: ZONES[key].color }))

  return (
    <Card className="p-4">
      <p className="label-sm mb-3">ZONE DISTRIBUTION</p>
      <div className="flex items-center gap-4">
        <PieChart width={100} height={100}>
          <Pie data={data} cx={45} cy={45} innerRadius={28} outerRadius={45}
            dataKey="value" stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div className="flex-1 space-y-1">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-sunset-muted">{d.name} · {ZONES[d.name].name}</span>
              </div>
              <span className="font-bold" style={{ color: d.color }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function StreakCalendar({ allSessions }) {
  const days = 28
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000)
    const dStr = d.toDateString()
    const hasSession = allSessions.some(s => new Date(s.date).toDateString() === dStr)
    const isToday = dStr === new Date().toDateString()
    return { d, hasSession, isToday }
  })

  return (
    <Card className="p-4">
      <p className="label-sm mb-3">TRAINING CALENDAR (28 days)</p>
      <div className="grid grid-cols-7 gap-1.5">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-center text-sunset-muted text-xs">{d}</div>
        ))}
        {cells.map((c, i) => (
          <div
            key={i}
            className="aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: c.hasSession ? (c.isToday ? '#FF6B35' : 'rgba(255,107,53,0.4)')
                : c.isToday ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.04)',
              border: c.isToday ? '1px solid #FF6B35' : '1px solid transparent',
              color: c.hasSession ? '#FFF5EE' : '#4A3F6B',
            }}
          >
            {c.d.getDate()}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function Progress() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState({ erg: [], gym: [], run: [] })
  const [loadData, setLoadData] = useState([])

  useEffect(() => {
    getAllSessions().then(s => {
      setSessions(s)
      const all = [...s.erg, ...s.gym, ...s.run]
      setLoadData(calcTrainingLoad(all, 42))
    })
  }, [])

  const allFlat = [...sessions.erg, ...sessions.gym, ...sessions.run]
  const streaks = calcStreaks(allFlat)
  const totalErgKm = sessions.erg.reduce((sum, s) => sum + (s.distanceM || 0) / 1000, 0)
  const totalRuns = sessions.run.length

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-sunset-text">Progress</h1>
          <p className="text-sunset-muted text-xs">Training analytics & trends</p>
        </div>
        <button onClick={() => navigate('/settings')} className="btn-ghost p-2">
          <Settings size={18} />
        </button>
      </div>

      {/* Summary rings */}
      <Card className="p-4">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-3xl font-black streak-fire">{streaks.current}</div>
            <div className="label-sm">streak</div>
            <div className="text-sunset-muted text-xs">best {streaks.longest}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-sunset-orange">{sessions.erg.length}</div>
            <div className="label-sm">erg sessions</div>
            <div className="text-sunset-muted text-xs">{Math.round(totalErgKm)}km total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-sunset-amber">{sessions.gym.length}</div>
            <div className="label-sm">gym sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-[#45B7D1]">{totalRuns}</div>
            <div className="label-sm">runs</div>
          </div>
        </div>
      </Card>

      <ErgTrendChart sessions={sessions.erg} targetErg={profile.targetErg2k} />
      <TrainingLoadChart loadData={loadData} />
      <VolumeByWeek allSessions={sessions} />
      <ZoneDistribution ergSessions={sessions.erg} />
      <StreakCalendar allSessions={allFlat} />

      <button onClick={() => navigate('/inspire')}
        className="w-full rounded-xl p-4 flex items-center justify-center gap-2"
        style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)' }}>
        <Sparkles size={16} style={{ color: '#B8A9C0' }} />
        <span className="text-sunset-muted text-sm">Inspiration & Training Tips</span>
      </button>
    </div>
  )
}

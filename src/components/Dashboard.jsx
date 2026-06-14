import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Gauge, Dumbbell, Play, Sparkles, ChevronRight, Zap } from 'lucide-react'
import { useApp } from '../App.jsx'
import { getErgSessions, getGymSessions, getRunSessions, getTodayCheckin } from '../utils/db.js'
import { calcStreaks, ergProgressPercent, formatPace, paceToWatts, ergTimeToSeconds } from '../utils/training.js'
import { getDailyQuote, getDailyAffirmation } from '../data/quotes.js'
import Card from './common/Card.jsx'
import ProgressRing from './common/ProgressRing.jsx'

function greet(name) {
  const h = new Date().getHours()
  const first = name?.split(' ')[0] || 'Athlete'
  if (h < 6)  return `Eyes open, ${first} 🌙`
  if (h < 12) return `Morning, ${first}`
  if (h < 17) return `Afternoon, ${first}`
  if (h < 21) return `Evening, ${first}`
  return `Night session, ${first} 🌙`
}

export default function Dashboard() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState({ erg: [], gym: [], run: [] })
  const [checkin, setCheckin] = useState(null)
  const quote = getDailyQuote()
  const affirmation = getDailyAffirmation()

  useEffect(() => {
    Promise.all([getErgSessions(60), getGymSessions(30), getRunSessions(30), getTodayCheckin()])
      .then(([erg, gym, run, ci]) => {
        setSessions({ erg, gym, run })
        setCheckin(ci)
      })
  }, [])

  const allSessions = [...sessions.erg, ...sessions.gym, ...sessions.run]
  const streaks = calcStreaks(allSessions)

  const thisWeek = allSessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    return d >= weekAgo
  })

  const weeklyMeters = sessions.erg.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    return d >= new Date(now - 7 * 86400000)
  }).reduce((sum, s) => sum + (s.distanceM || 0), 0)

  const bestRecentSplit = sessions.erg[0]?.avgSplitSeconds || null
  const recentWatts = bestRecentSplit ? paceToWatts(bestRecentSplit) : null

  const ergProgress = ergProgressPercent(
    sessions.erg[0]?.erg2kTime || profile.currentErg2k,
    profile.targetErg2k,
    profile.startErg2k || profile.currentErg2k,
  )

  const currentErgSecs = ergTimeToSeconds(sessions.erg[0]?.erg2kTime || profile.currentErg2k)
  const targetErgSecs  = ergTimeToSeconds(profile.targetErg2k)
  const diffSecs = currentErgSecs && targetErgSecs ? Math.round((currentErgSecs - targetErgSecs) * 10) / 10 : null

  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sunset-muted text-xs uppercase tracking-widest">{dateStr}</p>
          <h1 className="text-xl font-black text-sunset-text">{greet(profile.name)}</h1>
        </div>
        <button onClick={() => navigate('/inspire')} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}>
          <Sparkles size={16} className="text-sunset-orange" />
        </button>
      </div>

      {/* Erg Goal Card */}
      <Card glow className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="label-sm">2K GOAL PROGRESS</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-sunset-text">
                {profile.currentErg2k || '--:--'}
              </span>
              <span className="text-sunset-muted text-sm">→</span>
              <span className="text-lg font-bold text-sunset-orange">
                {profile.targetErg2k || '--:--'}
              </span>
            </div>
            {diffSecs !== null && diffSecs > 0 && (
              <p className="text-sunset-muted text-xs mt-1">{diffSecs}s remaining to goal</p>
            )}
          </div>
          <ProgressRing percent={ergProgress} size={72} color="#FF6B35" label={`${ergProgress}%`} sublabel="done" />
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${ergProgress}%` }} />
        </div>
        <button
          className="mt-3 text-xs text-sunset-orange font-semibold flex items-center gap-1"
          onClick={() => navigate('/erg')}
        >
          Log erg session <ChevronRight size={14} />
        </button>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Flame size={18} className="mx-auto mb-1" style={{ color: '#FF4757' }} />
          <div className="streak-fire text-2xl">{streaks.current}</div>
          <div className="label-sm">streak</div>
        </Card>
        <Card className="p-3 text-center">
          <Gauge size={18} className="mx-auto mb-1 text-sunset-orange" />
          <div className="text-xl font-black text-sunset-text">{Math.round(weeklyMeters / 1000) || 0}</div>
          <div className="label-sm">km this wk</div>
        </Card>
        <Card className="p-3 text-center">
          <Zap size={18} className="mx-auto mb-1 text-sunset-gold" />
          <div className="text-xl font-black text-sunset-text">{recentWatts || '--'}</div>
          <div className="label-sm">avg watts</div>
        </Card>
      </div>

      {/* Daily Quote */}
      <Card className="p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 50%, #FF6B35, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sunset-gold text-lg">"</span>
            <span className="label-sm text-sunset-gold">{quote.category?.toUpperCase()}</span>
          </div>
          <p className="text-sunset-text text-sm font-semibold leading-relaxed italic">
            {quote.text}
          </p>
          <p className="text-sunset-muted text-xs mt-2">— {quote.author}</p>
        </div>
      </Card>

      {/* Daily Affirmation */}
      <div className="px-1">
        <p className="text-center text-sunset-peach text-sm font-medium italic">
          ✦ {affirmation}
        </p>
      </div>

      {/* Quick Log */}
      <div>
        <p className="label-sm mb-2 px-1">QUICK LOG</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Erg', icon: Gauge, path: '/erg', color: '#FF6B35' },
            { label: 'Gym', icon: Dumbbell, path: '/train/gym', color: '#FDB931' },
            { label: 'Run', icon: Play, path: '/train/run', color: '#45B7D1' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95"
              style={{ background: `${color}18`, border: `1px solid ${color}40` }}
            >
              <Icon size={22} style={{ color }} />
              <span className="text-xs font-bold text-sunset-text">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* This Week */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="label-sm">THIS WEEK ({thisWeek.length} sessions)</p>
          <button className="text-xs text-sunset-orange" onClick={() => navigate('/progress')}>View all</button>
        </div>
        {thisWeek.length === 0 ? (
          <Card className="p-4 text-center">
            <p className="text-sunset-muted text-sm">No sessions logged yet this week.</p>
            <p className="text-sunset-muted text-xs mt-1">Get on the erg and make it happen.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {thisWeek.slice(0, 4).map((s, i) => {
              const isErg = !!s.avgSplitSeconds
              const isRun = !!s.distanceM && !isErg
              return (
                <Card key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{isErg ? '🚣' : isRun ? '🏃' : '💪'}</span>
                    <div>
                      <p className="text-sunset-text text-sm font-semibold">{s.name || s.type || 'Session'}</p>
                      <p className="text-sunset-muted text-xs">
                        {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isErg && s.avgSplitSeconds && (
                      <p className="text-sunset-orange text-sm font-bold">
                        {formatPace(s.avgSplitSeconds)}<span className="text-xs text-sunset-muted">/500</span>
                      </p>
                    )}
                    {isRun && (
                      <p className="text-sunset-amber text-sm font-bold">
                        {(s.distanceM / 1000).toFixed(1)}km
                      </p>
                    )}
                    {!isErg && !isRun && s.durationSeconds && (
                      <p className="text-sunset-gold text-sm font-bold">
                        {Math.round(s.durationSeconds / 60)}min
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Inspire CTA */}
      <button
        onClick={() => navigate('/inspire')}
        className="w-full rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(45,43,85,0.5))', border: '1px solid rgba(108,92,231,0.3)' }}
      >
        <div className="text-left">
          <p className="text-sunset-text font-bold text-sm">Daily Inspiration</p>
          <p className="text-sunset-muted text-xs">Quotes · Affirmations · Training tips</p>
        </div>
        <Sparkles size={20} style={{ color: '#B8A9C0' }} />
      </button>
    </div>
  )
}

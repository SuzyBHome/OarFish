import { saveStravaTokens, getStravaTokens, clearStravaTokens } from './db.js'

const CLIENT_ID     = import.meta.env.VITE_STRAVA_CLIENT_ID || ''
const REDIRECT_URI  = `${window.location.origin}/strava-callback`
const SCOPES        = 'read,activity:read'
const API_BASE      = 'https://www.strava.com/api/v3'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getAuthUrl(state = crypto.randomUUID()) {
  sessionStorage.setItem('strava_state', state)
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPES,
    state,
  })
  return `https://www.strava.com/oauth/authorize?${params}`
}

export async function handleCallback(code, state) {
  const savedState = sessionStorage.getItem('strava_state')
  if (state !== savedState) throw new Error('State mismatch — possible CSRF')

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  const tokens = await res.json()
  await saveStravaTokens({
    accessToken:  tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt:    tokens.expires_at,
    athlete:      tokens.athlete,
  })
  return tokens
}

async function getFreshToken() {
  const stored = await getStravaTokens()
  if (!stored) return null
  if (Date.now() / 1000 < stored.expiresAt - 300) return stored.accessToken

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     CLIENT_ID,
      client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET || '',
      refresh_token: stored.refreshToken,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) { await clearStravaTokens(); return null }
  const data = await res.json()
  await saveStravaTokens({ ...stored, accessToken: data.access_token, expiresAt: data.expires_at })
  return data.access_token
}

async function apiGet(path) {
  const token = await getFreshToken()
  if (!token) throw new Error('Not authenticated with Strava')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`)
  return res.json()
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

export async function getAthleteProfile() {
  return apiGet('/athlete')
}

export async function getRecentActivities(perPage = 30) {
  return apiGet(`/athlete/activities?per_page=${perPage}`)
}

export async function getRowingActivities(perPage = 50) {
  const all = await getRecentActivities(perPage)
  return all.filter(a => ['Rowing', 'VirtualRow'].includes(a.type))
}

export async function getRunActivities(perPage = 50) {
  const all = await getRecentActivities(perPage)
  return all.filter(a => ['Run', 'TrailRun', 'VirtualRun'].includes(a.type))
}

export function stravaActivityToRunSession(a) {
  return {
    stravaId:        a.id,
    name:            a.name,
    date:            a.start_date,
    distanceM:       a.distance,
    durationSeconds: a.moving_time,
    elevationM:      a.total_elevation_gain,
    avgHR:           a.average_heartrate,
    maxHR:           a.max_heartrate,
    avgPacePerKm:    a.distance > 0 ? a.moving_time / (a.distance / 1000) : 0,
    type:            'easy',
    source:          'strava',
  }
}

export async function isConnected() {
  const tokens = await getStravaTokens()
  return !!tokens?.accessToken
}

export async function disconnect() {
  await clearStravaTokens()
}

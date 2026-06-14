// Garmin Health API integration
// Requires a backend redirect handler (Garmin does not support pure client-side OAuth)
// Set VITE_GARMIN_CLIENT_ID in .env and deploy the backend endpoint at VITE_GARMIN_BACKEND_URL

const CLIENT_ID    = import.meta.env.VITE_GARMIN_CLIENT_ID || ''
const BACKEND_URL  = import.meta.env.VITE_GARMIN_BACKEND_URL || ''

export const GARMIN_SETUP_INSTRUCTIONS = `
To enable Garmin Connect sync:
1. Register at developer.garmin.com and create a Health API application
2. Set VITE_GARMIN_CLIENT_ID in your .env file
3. Deploy the backend OAuth handler (see /docs/garmin-backend.md)
4. Set VITE_GARMIN_BACKEND_URL to your backend URL
`

export function isConfigured() {
  return !!(CLIENT_ID && BACKEND_URL)
}

export async function isConnected() {
  try {
    const token = localStorage.getItem('garmin_token')
    return !!token
  } catch {
    return false
  }
}

export function startAuth() {
  if (!isConfigured()) {
    throw new Error('Garmin integration requires backend configuration. ' + GARMIN_SETUP_INSTRUCTIONS)
  }
  const state = crypto.randomUUID()
  sessionStorage.setItem('garmin_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: `${BACKEND_URL}/garmin-callback`,
    state,
    scope: 'activity:read',
  })
  window.location.href = `https://connect.garmin.com/oauthConfirm?${params}`
}

export async function getRecentWorkouts() {
  const token = localStorage.getItem('garmin_token')
  if (!token || !BACKEND_URL) return []
  try {
    const res = await fetch(`${BACKEND_URL}/garmin/activities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export function disconnect() {
  localStorage.removeItem('garmin_token')
}

export function garminActivityToSession(a) {
  return {
    garminId:        a.activityId,
    name:            a.activityName,
    date:            a.startTimeLocal,
    distanceM:       a.distance,
    durationSeconds: a.duration,
    avgHR:           a.averageHR,
    maxHR:           a.maxHR,
    calories:        a.calories,
    source:          'garmin',
  }
}

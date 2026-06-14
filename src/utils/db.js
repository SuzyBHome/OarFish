import Dexie from 'dexie'

export const db = new Dexie('oarfish')

db.version(1).stores({
  profile:       '++id',
  ergSessions:   '++id, date, type',
  gymSessions:   '++id, date, type',
  runSessions:   '++id, date, type',
  dailyCheckins: '++id, date',
  goals:         '++id, category',
  stravaTokens:  '++id',
})

// Seed default profile if empty
db.on('ready', async () => {
  const count = await db.profile.count()
  if (count === 0) {
    await db.profile.add({
      id: 1,
      name: '',
      maxHR: 195,
      currentErg2k: '',
      targetErg2k: '',
      targetDate: '',
      ftpWatts: 200,
      weightKg: 0,
      club: '',
      side: 'sculls',
    })
  }
})

export async function getProfile() {
  return db.profile.get(1)
}

export async function saveProfile(updates) {
  return db.profile.put({ ...updates, id: 1 })
}

export async function addErgSession(session) {
  return db.ergSessions.add({ ...session, date: session.date || new Date().toISOString() })
}

export async function getErgSessions(limit = 50) {
  return db.ergSessions.orderBy('date').reverse().limit(limit).toArray()
}

export async function addGymSession(session) {
  return db.gymSessions.add({ ...session, date: session.date || new Date().toISOString() })
}

export async function getGymSessions(limit = 30) {
  return db.gymSessions.orderBy('date').reverse().limit(limit).toArray()
}

export async function addRunSession(session) {
  return db.runSessions.add({ ...session, date: session.date || new Date().toISOString() })
}

export async function getRunSessions(limit = 30) {
  return db.runSessions.orderBy('date').reverse().limit(limit).toArray()
}

export async function getTodayCheckin() {
  const today = new Date().toDateString()
  const all = await db.dailyCheckins.toArray()
  return all.find(c => new Date(c.date).toDateString() === today) || null
}

export async function saveDailyCheckin(data) {
  const existing = await getTodayCheckin()
  if (existing) {
    return db.dailyCheckins.update(existing.id, data)
  }
  return db.dailyCheckins.add({ ...data, date: new Date().toISOString() })
}

export async function getCheckinHistory(days = 30) {
  return db.dailyCheckins.orderBy('date').reverse().limit(days).toArray()
}

export async function getAllSessions() {
  const [erg, gym, run] = await Promise.all([
    getErgSessions(100),
    getGymSessions(100),
    getRunSessions(100),
  ])
  return { erg, gym, run }
}

export async function getStravaTokens() {
  return db.stravaTokens.get(1)
}

export async function saveStravaTokens(tokens) {
  return db.stravaTokens.put({ ...tokens, id: 1 })
}

export async function clearStravaTokens() {
  return db.stravaTokens.delete(1)
}

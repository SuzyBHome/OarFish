import { useState } from 'react'
import { ChevronRight, Anchor } from 'lucide-react'

const STEPS = ['welcome', 'profile', 'erg', 'done']

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '', maxHR: '195', currentErg2k: '', targetErg2k: '',
    targetDate: '', club: '', side: 'sculls',
  })

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }))
  const next = () => setStep(s => s + 1)

  const finish = () => {
    const targetDate = data.targetDate || ''
    const startErg2k = data.currentErg2k
    onComplete({
      ...data,
      maxHR: parseInt(data.maxHR) || 195,
      weightKg: 0,
      startErg2k,
      targetDate,
    })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-8 animate-fade-in">
      {step === 0 && (
        <div className="text-center space-y-6">
          <img src="/icons/oarfish.svg" className="w-24 h-24 mx-auto" alt="OarFish" />
          <div>
            <h1 className="text-4xl font-black text-sunset-text mb-2 tracking-tight">OarFish</h1>
            <p className="text-sunset-muted text-base leading-relaxed max-w-xs mx-auto">
              Elite rowing performance tracker. Built for athletes who measure greatness in tenths of a second.
            </p>
          </div>
          <div className="space-y-2 text-sm text-sunset-muted max-w-xs mx-auto text-left">
            {['Erg score tracking toward your 10-point target', 'CTL/ATL training load monitoring', 'Strava & Garmin sync', 'Henley-inspired daily motivation'].map(f => (
              <div key={f} className="flex items-start gap-2">
                <span className="text-sunset-orange mt-0.5">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full text-base py-4" onClick={next}>
            Get Started <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full space-y-5">
          <div>
            <h2 className="text-2xl font-black text-sunset-text mb-1">About You</h2>
            <p className="text-sunset-muted text-sm">Set up your athlete profile</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="input-label">Your Name</label>
              <input placeholder="e.g. Alex Smith" value={data.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Club / Squad</label>
              <input placeholder="e.g. Leander Club" value={data.club} onChange={e => set('club', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Max Heart Rate (bpm)</label>
              <input type="number" placeholder="195" value={data.maxHR} onChange={e => set('maxHR', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Rowing Style</label>
              <select value={data.side} onChange={e => set('side', e.target.value)}>
                <option value="sculls">Sculls (2 blades)</option>
                <option value="sweep">Sweep (1 blade)</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={next} disabled={!data.name}>
            Continue <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full space-y-5">
          <div>
            <h2 className="text-2xl font-black text-sunset-text mb-1">Your Erg Goal</h2>
            <p className="text-sunset-muted text-sm">We'll track every tenth of a second</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="input-label">Current 2k Time (mm:ss.t)</label>
              <input placeholder="e.g. 6:45.2" value={data.currentErg2k} onChange={e => set('currentErg2k', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Target 2k Time</label>
              <input placeholder="e.g. 6:35.2" value={data.targetErg2k} onChange={e => set('targetErg2k', e.target.value)} />
            </div>
            <div>
              <label className="input-label">Target Date (optional)</label>
              <input type="date" value={data.targetDate} onChange={e => set('targetDate', e.target.value)} />
            </div>
            {data.currentErg2k && data.targetErg2k && (
              <div className="glow-card p-3 text-center">
                <div className="text-sunset-muted text-xs mb-1">YOUR GOAL</div>
                <div className="text-sunset-orange font-bold text-lg">
                  {data.currentErg2k} → {data.targetErg2k}
                </div>
              </div>
            )}
          </div>
          <button className="btn-primary w-full" onClick={finish}>
            <Anchor size={18} /> Start Training
          </button>
          <button className="btn-ghost w-full text-sm" onClick={finish}>Skip for now</button>
        </div>
      )}
    </div>
  )
}

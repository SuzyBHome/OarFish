import { useNavigate } from 'react-router-dom'
import { Dumbbell, Play, ChevronRight } from 'lucide-react'
import Card from './common/Card.jsx'

export default function TrainHub() {
  const navigate = useNavigate()
  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-black text-sunset-text">Training</h1>
        <p className="text-sunset-muted text-xs">Gym & Running sessions</p>
      </div>
      <Card glow className="p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/train/gym')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(253,185,49,0.2)' }}>
              <Dumbbell size={22} className="text-sunset-gold" />
            </div>
            <div>
              <p className="text-sunset-text font-bold">Gym Sessions</p>
              <p className="text-sunset-muted text-xs">Strength · Power · Core</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sunset-muted" />
        </div>
      </Card>
      <Card glow className="p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/train/run')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(69,183,209,0.2)' }}>
              <Play size={22} className="text-[#45B7D1]" />
            </div>
            <div>
              <p className="text-sunset-text font-bold">Run Sessions</p>
              <p className="text-sunset-muted text-xs">Easy · Tempo · Intervals · Strava sync</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-sunset-muted" />
        </div>
      </Card>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { Home, Gauge, Dumbbell, Target, TrendingUp } from 'lucide-react'

const TABS = [
  { to: '/',         icon: Home,       label: 'Home'  },
  { to: '/erg',      icon: Gauge,      label: 'Erg'   },
  { to: '/train',    icon: Dumbbell,   label: 'Train' },
  { to: '/goals',    icon: Target,     label: 'Goals' },
  { to: '/progress', icon: TrendingUp, label: 'Stats' },
]

export default function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background: 'linear-gradient(to top, rgba(15,12,41,0.98), rgba(26,26,62,0.95))',
        borderTop: '1px solid rgba(255,107,53,0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {TABS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={isActive
                ? { color: '#FF6B35', background: 'rgba(255,107,53,0.12)' }
                : { color: '#B8A9C0' }
              }
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

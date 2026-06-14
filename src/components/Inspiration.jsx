import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, RefreshCw, Share2 } from 'lucide-react'
import { QUOTES, QUOTE_CATEGORIES, getDailyQuote, getDailyAffirmation, getDailyTip, getQuoteByCategory } from '../data/quotes.js'
import Card from './common/Card.jsx'

export default function Inspiration() {
  const navigate = useNavigate()
  const [activeQuote, setActiveQuote] = useState(getDailyQuote())
  const [activeCategory, setActiveCategory] = useState('all')
  const [copied, setCopied] = useState(false)
  const affirmation = getDailyAffirmation()
  const tip = getDailyTip()

  const refresh = () => {
    if (activeCategory === 'all') {
      const i = Math.floor(Math.random() * QUOTES.length)
      setActiveQuote(QUOTES[i])
    } else {
      setActiveQuote(getQuoteByCategory(activeCategory))
    }
  }

  const filterQuote = (cat) => {
    setActiveCategory(cat)
    if (cat === 'all') {
      setActiveQuote(getDailyQuote())
    } else {
      setActiveQuote(getQuoteByCategory(cat))
    }
  }

  const share = async () => {
    const text = `"${activeQuote.text}" — ${activeQuote.author} | OarFish`
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  const catColor = QUOTE_CATEGORIES[activeQuote.category]?.color || '#FF6B35'

  return (
    <div className="inspire-bg min-h-dvh pb-24 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-8 pb-4">
        <button onClick={() => navigate('/')} className="btn-ghost p-2">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sunset-text font-black tracking-tight">Daily Inspiration</span>
        <div className="w-10" />
      </div>

      {/* Hero Quote */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        <div
          className="w-full rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(45,43,85,0.55)',
            border: `1px solid ${catColor}40`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 48px ${catColor}20`,
          }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${catColor}, transparent 70%)` }} />
          <div className="relative">
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: catColor + '25', color: catColor }}
              >
                {QUOTE_CATEGORIES[activeQuote.category]?.label || 'Rowing'}
              </span>
            </div>
            <p className="text-6xl mb-4 font-black leading-none" style={{ color: catColor, opacity: 0.6 }}>"</p>
            <p className="text-sunset-text text-xl font-bold leading-relaxed mb-6" style={{ fontStyle: 'italic' }}>
              {activeQuote.text}
            </p>
            <p className="text-sunset-muted text-sm">— {activeQuote.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-4">
          <button onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,107,53,0.2)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}>
            <RefreshCw size={14} /> New quote
          </button>
          <button onClick={share}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Share2 size={14} /> {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => filterQuote('all')}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={activeCategory === 'all'
              ? { background: 'rgba(255,107,53,0.3)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.5)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            All
          </button>
          {Object.entries(QUOTE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => filterQuote(key)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={activeCategory === key
                ? { background: cat.color + '30', color: cat.color, border: `1px solid ${cat.color}50` }
                : { background: 'rgba(255,255,255,0.05)', color: '#B8A9C0', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Affirmation */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(45,43,85,0.4)', border: '1px solid rgba(255,107,157,0.25)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-sunset-pink mb-2">Today's Affirmation</p>
          <p className="text-sunset-text font-semibold text-base italic">✦ {affirmation}</p>
        </div>
      </div>

      {/* Training Tip */}
      <div className="px-4">
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(45,43,85,0.4)', border: '1px solid rgba(253,185,49,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sunset-gold">Coach's Tip</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(253,185,49,0.2)', color: '#FDB931' }}>
              {tip.title}
            </span>
          </div>
          <p className="text-sunset-muted text-sm leading-relaxed">{tip.tip}</p>
        </div>
      </div>
    </div>
  )
}

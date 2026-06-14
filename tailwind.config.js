/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sunset: {
          deep:    '#0F0C29',
          navy:    '#1A1A3E',
          purple:  '#2D2B55',
          mauve:   '#4A3F6B',
          orange:  '#FF6B35',
          coral:   '#FF4757',
          amber:   '#F7931E',
          gold:    '#FDB931',
          peach:   '#FFCBA4',
          pink:    '#FF6B9D',
          text:    '#FFF5EE',
          muted:   '#B8A9C0',
        }
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(160deg, #0F0C29 0%, #2D2B55 45%, #1A1A3E 100%)',
        'card-glow':       'linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,71,87,0.05) 100%)',
        'gold-gradient':   'linear-gradient(90deg, #F7931E, #FDB931)',
        'fire-gradient':   'linear-gradient(90deg, #FF4757, #FF6B35, #F7931E)',
      },
      fontFamily: {
        display: ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':       'fadeIn 0.5s ease-in-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'gradient-shift':'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn:        { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:       { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        glowPulse:     { '0%,100%': { boxShadow: '0 0 8px rgba(255,107,53,0.4)' }, '50%': { boxShadow: '0 0 24px rgba(255,107,53,0.8)' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      boxShadow: {
        'sunset': '0 4px 24px rgba(255, 107, 53, 0.25)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.5)',
        'glow-gold':   '0 0 20px rgba(253, 185, 49, 0.5)',
        'card':        '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

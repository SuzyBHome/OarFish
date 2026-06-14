export default function Card({ children, className = '', glow = false, onClick }) {
  const base = glow ? 'glow-card' : 'sunset-card'
  return (
    <div
      className={`${base} ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

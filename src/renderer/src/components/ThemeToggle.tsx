interface ThemeToggleProps {
  icon: string
  label: string
  nextLabel: string
  onToggle: () => void
}

export default function ThemeToggle({ icon, label, nextLabel, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={`Theme wechseln. Nächstes: ${nextLabel}`}
      className="theme-toggle"
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  )
}

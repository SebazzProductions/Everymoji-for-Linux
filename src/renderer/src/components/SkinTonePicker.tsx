import { SKIN_TONE_LABELS } from '../hooks/useEmojis'

const SKIN_TONE_COLORS = [
  '#FBBF24',
  '#FDE68A',
  '#FCD34D',
  '#F59E0B',
  '#D97706',
  '#92400E'
]

interface SkinTonePickerProps {
  skinTone: number
  onChange: (index: number) => void
}

export default function SkinTonePicker({ skinTone, onChange }: SkinTonePickerProps) {
  return (
    <div className="skin-panel flex items-center gap-1.5 px-3.5 py-2 animate-slide-down">
      <span className="skin-label text-[11px] font-medium tracking-wide uppercase mr-0.5">
        Hautton
      </span>
      <div className="skin-row flex items-center gap-1 rounded-full px-1.5 py-1">
        {SKIN_TONE_LABELS.map((label, i) => (
          <button
            key={i}
            title={label}
            onClick={() => onChange(i)}
            className={`skin-swatch w-[18px] h-[18px] rounded-full transition-all duration-200 ${skinTone === i ? 'skin-swatch--active' : ''}`}
            style={{
              background: SKIN_TONE_COLORS[i]
            }}
          />
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

interface SendButtonProps {
  selectedEmoji: string | null
  onSend: () => void
}

export default function SendButton({ selectedEmoji, onSend }: SendButtonProps) {
  const [sent, setSent] = useState(false)
  const [prevEmoji, setPrevEmoji] = useState<string | null>(null)
  const [animateEmoji, setAnimateEmoji] = useState(false)

  useEffect(() => {
    if (!selectedEmoji || selectedEmoji === prevEmoji) {
      return undefined
    }

    setPrevEmoji(selectedEmoji)
    setAnimateEmoji(true)
    const t = setTimeout(() => setAnimateEmoji(false), 300)
    return () => clearTimeout(t)
  }, [selectedEmoji, prevEmoji])

  const handleSend = (): void => {
    if (!selectedEmoji) return
    onSend()
    setSent(true)
    setTimeout(() => setSent(false), 1000)
  }

  return (
    <div className="footer-shell relative flex items-center gap-3 px-3.5 py-2.5">
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        <div className={`selected-preview relative w-9 h-9 flex items-center justify-center rounded-xl ${animateEmoji ? 'animate-success-pop' : ''}`}>
          <span className="text-[24px] leading-none">
            {selectedEmoji || '🫥'}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`footer-title text-[12px] font-medium truncate transition-colors duration-200 ${selectedEmoji ? 'footer-title--active' : ''}`}>
            {selectedEmoji ? 'Bereit zum Senden' : 'Emoji wählen…'}
          </span>
          {selectedEmoji && (
            <span className="footer-subtitle text-[10px] truncate">
              Doppelklick für Schnellsenden
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!selectedEmoji}
        className={`send-button relative px-5 h-9 rounded-xl text-[13px] font-semibold tracking-wide transition-all duration-300 overflow-hidden ${
          sent
            ? 'send-button--sent'
            : selectedEmoji
              ? 'send-button--active'
              : 'send-button--disabled'
        }`}
      >
        {selectedEmoji && !sent && (
          <div className="send-button__shine absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" />
        )}
        <span className="relative flex items-center gap-1.5">
          {sent ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-success-pop">
                <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw" />
              </svg>
              Gesendet
            </>
          ) : (
            <>
              Senden
              {selectedEmoji && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70">
                  <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </>
          )}
        </span>
      </button>
    </div>
  )
}

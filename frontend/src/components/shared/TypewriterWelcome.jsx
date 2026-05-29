import { useEffect, useState } from 'react'

export default function TypewriterWelcome({ text, onComplete }) {
  const words = text.split(' ')
  const [visibleCount, setVisibleCount] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (visibleCount >= words.length) {
      const doneTimer = setTimeout(() => {
        setShowCursor(false)
        onComplete?.()
      }, 1200)
      return () => clearTimeout(doneTimer)
    }

    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1)
    }, 180)
    return () => clearTimeout(timer)
  }, [visibleCount, words.length, onComplete])

  return (
    <div
      className="typewriter-welcome"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <span className="typewriter-welcome__text">
        {words.slice(0, visibleCount).join(' ')}
        {showCursor && <span className="typewriter-welcome__cursor" aria-hidden="true">|</span>}
      </span>
    </div>
  )
}

import { useEffect, useState } from 'react'

/**
 * LoadingSpinner - Elegant loading animation
 * Used during API calls for content generation
 */
export default function LoadingSpinner({ message = 'Generating...', size = 'medium' }) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '.' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const sizeMap = {
    small: { container: 'h-16 w-16', spinner: 'h-12 w-12', text: 'text-sm' },
    medium: { container: 'h-24 w-24', spinner: 'h-20 w-20', text: 'text-base' },
    large: { container: 'h-32 w-32', spinner: 'h-28 w-28', text: 'text-lg' },
  }

  const styles = sizeMap[size]

  return (
    <div className="loading-spinner">
      <div className={`loading-spinner__container ${styles.container}`}>
        <svg
          className={`loading-spinner__svg ${styles.spinner}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.2"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="62.83"
            strokeLinecap="round"
            className="loading-spinner__arc"
          />
        </svg>
      </div>
      <p className={`loading-spinner__message ${styles.text}`}>
        {message}
        <span className="loading-spinner__dots">{dots}</span>
      </p>
    </div>
  )
}

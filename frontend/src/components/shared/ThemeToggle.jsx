import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`theme-toggle ${className}`.trim()} role="group" aria-label="Theme">
      <button
        type="button"
        className={`theme-toggle__option ${theme === 'day' ? 'theme-toggle__option--active' : ''}`}
        onClick={() => setTheme('day')}
        aria-pressed={theme === 'day'}
      >
        <span aria-hidden="true">&#9728;&#65039;</span> Day
      </button>
      <button
        type="button"
        className={`theme-toggle__option ${theme === 'night' ? 'theme-toggle__option--active' : ''}`}
        onClick={() => setTheme('night')}
        aria-pressed={theme === 'night'}
      >
        <span aria-hidden="true">&#127769;</span> Night
      </button>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'

export default function AppHeader({ showBack = false, backLabel = 'Dashboard' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function go(path) {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          {showBack ? (
            <button type="button" className="app-header__back" onClick={() => go('/')}>
              &larr; {backLabel}
            </button>
          ) : (
            <button type="button" className="app-header__logo" onClick={() => go('/')}>
              <span className="app-header__logo-icon" aria-hidden="true">&#10022;</span>
              <span className="app-header__logo-text">Lightline</span>
            </button>
          )}
        </div>

        <nav className={`app-header__nav ${menuOpen ? 'app-header__nav--open' : ''}`} aria-label="Main">
          <button type="button" className="app-header__link" onClick={() => go('/history')}>
            History
          </button>
          <button type="button" className="app-header__link" onClick={() => go('/models')}>
            AI Models
          </button>
          <span className="app-header__user">{user?.name}</span>
          <button type="button" className="app-header__logout" onClick={logout}>
            Sign Out
          </button>
        </nav>

        <ThemeToggle className="app-header__theme-mobile" />

        <button
          type="button"
          className="app-header__menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </div>
    </header>
  )
}

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../hooks/useAuth'
import PasswordInput from '../shared/PasswordInput'
import TermsConditionsModal from './TermsConditionsModal'
import PrivacyPolicyModal from './PrivacyPolicyModal'

export default function AuthPage() {
  const { login, register, loginWithGoogle, forgotPassword, resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const resetTokenFromUrl = searchParams.get('reset') || ''

  const [mode, setMode] = useState(resetTokenFromUrl ? 'reset' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [resetToken, setResetToken] = useState(resetTokenFromUrl)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (resetTokenFromUrl) setMode('reset')
  }, [resetTokenFromUrl])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setSuccess('')
    setResetUrl('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else if (mode === 'register') {
        if (!form.name.trim()) throw new Error('Please enter your name.')
        if (!termsAgreed) throw new Error('Please agree to the Terms and Conditions and Privacy Policy.')
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match.')
        await register({ name: form.name, email: form.email, password: form.password })
      } else if (mode === 'forgot') {
        const res = await forgotPassword(form.email)
        setSuccess(res.message)
        if (res.resetUrl) setResetUrl(res.resetUrl)
      } else if (mode === 'reset') {
        if (!resetToken.trim()) throw new Error('Reset link is invalid or missing.')
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match.')
        const res = await resetPassword({ token: resetToken.trim(), password: form.password })
        setSuccess(res.message)
        setTimeout(() => switchMode('login'), 2000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: 'Sign In',
    register: 'Create Account',
    forgot: 'Forgot Password',
    reset: 'Reset Password',
  }

  return (
    <div className="auth-page">

      <div className="auth-card">
        <div className="auth-card__logo">
          <span className="auth-card__logo-icon" aria-hidden="true">&#10022;</span>
          <span className="auth-card__logo-text">Lightline</span>
        </div>
        <p className="auth-card__tagline">Every minister. Every message. Every time.</p>

        {mode === 'login' || mode === 'register' ? (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tabs__btn ${mode === 'login' ? 'auth-tabs__btn--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tabs__btn ${mode === 'register' ? 'auth-tabs__btn--active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </div>
        ) : (
          <h2 className="auth-card__title">{titles[mode]}</h2>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-form__field">
              <label className="auth-form__label">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Pastor John Adeyemi"
                className="auth-form__input"
                required
                autoComplete="name"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div className="auth-form__field">
              <label className="auth-form__label">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@ministry.org"
                className="auth-form__input"
                required
                autoComplete="email"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <PasswordInput
              name="password"
              label={mode === 'reset' ? 'New Password' : 'Password'}
              value={form.password}
              onChange={handleChange}
              placeholder={mode === 'register' || mode === 'reset' ? 'At least 8 characters' : 'Your password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              showStrength={mode === 'register' || mode === 'reset'}
            />
          )}

          {(mode === 'register' || mode === 'reset') && (
            <PasswordInput
              name="confirmPassword"
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              showStrength={false}
            />
          )}

          {mode === 'register' && (
            <div className="auth-form__field auth-form__checkbox-group">
              <label className="auth-form__checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="auth-form__checkbox"
                  required
                />
                <span>I agree to the</span>
                <button
                  type="button"
                  className="auth-form__link"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms and Conditions
                </button>
                <span>and</span>
                <button
                  type="button"
                  className="auth-form__link"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  Privacy Policy
                </button>
              </label>
            </div>
          )}

          {mode === 'reset' && !resetTokenFromUrl && (
            <div className="auth-form__field">
              <label className="auth-form__label">Reset Code</label>
              <input
                name="resetToken"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste code from your reset link"
                className="auth-form__input"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <button type="button" className="auth-form__forgot" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          )}

          {error && <p className="auth-form__error">{error}</p>}
          {success && <p className="auth-form__success">{success}</p>}
          {resetUrl && (
            <p className="auth-form__dev-link">
              Dev reset link: <a href={resetUrl}>{resetUrl}</a>
            </p>
          )}

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Please wait...' : titles[mode]}
          </button>
        </form>

        {(mode === 'login' || mode === 'register') && googleClientId && (
          <div className="auth-google">
            <div className="auth-google__divider">
              <span>or</span>
            </div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed.')}
              theme="outline"
              size="large"
              width="100%"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
            />
          </div>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <button type="button" className="auth-form__back" onClick={() => switchMode('login')}>
            Back to Sign In
          </button>
        )}

        <p className="auth-card__verse">
          &quot;Your word is a lamp to my feet and a light to my path.&quot; &mdash; Psalm 119:105
        </p>
      </div>

      <TermsConditionsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}

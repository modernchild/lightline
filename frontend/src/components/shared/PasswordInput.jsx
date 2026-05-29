import { useState } from 'react'
import { getPasswordStrength } from '../../utils/passwordStrength'

export default function PasswordInput({
  name = 'password',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  showStrength = false,
  label = 'Password',
}) {
  const [visible, setVisible] = useState(false)
  const strength = showStrength ? getPasswordStrength(value) : null

  return (
    <div className="password-field">
      <label className="password-field__label">{label}</label>
      <div className="password-field__wrap">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="password-field__input"
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {showStrength && value && (
        <div className="password-strength" role="status" aria-live="polite">
          <div className="password-strength__track">
            <div
              className="password-strength__bar"
              style={{ width: `${strength.percent}%`, background: strength.color }}
            />
          </div>
          <span className="password-strength__label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}
    </div>
  )
}

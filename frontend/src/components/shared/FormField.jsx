// Reusable labelled input, textarea, and select

export function Field({ label, hint, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {hint && <p className="form-field__hint">{hint}</p>}
      <div className="form-field__control">{children}</div>
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`form-field__input ${className}`.trim()} {...props} />
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`form-field__input form-field__input--textarea ${className}`.trim()}
      {...props}
    />
  )
}

export function Select({ className = '', options, placeholder, ...props }) {
  return (
    <select className={`form-field__input form-field__input--select ${className}`.trim()} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )
      )}
    </select>
  )
}
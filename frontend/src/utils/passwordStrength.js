export function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', percent: 0, color: 'transparent' }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  const levels = [
    { label: 'Very weak', percent: 20, color: '#DC2626' },
    { label: 'Weak', percent: 40, color: '#F97316' },
    { label: 'Fair', percent: 60, color: '#EAB308' },
    { label: 'Good', percent: 80, color: '#22C55E' },
    { label: 'Strong', percent: 100, color: '#16A34A' },
  ]

  const level = levels[Math.min(score, levels.length - 1)]
  return { score, ...level }
}

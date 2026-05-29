/** First token of display name (e.g. "Pastor John Adeyemi" → "Pastor") */
export function getFirstName(name) {
  if (!name || typeof name !== 'string') return ''
  return name.trim().split(/\s+/)[0] || ''
}

// src/components/shared/OutputViewer.jsx
// Renders streamed markdown output
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

export default function OutputViewer({ content, meta, streaming, onReset }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.bar}>
        <span style={styles.barLabel}>{streaming ? 'Generating...' : 'Output ready'}</span>
        <div style={styles.barActions}>
          <button type="button" onClick={handleCopy} style={styles.copyBtn} disabled={streaming || !content}>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          {onReset && !streaming && (
            <button type="button" onClick={onReset} style={styles.resetBtn}>
              New Request
            </button>
          )}
        </div>
      </div>

      <div style={styles.content} className="markdown-output">
        <ReactMarkdown>{content || (streaming ? '_Waiting for first tokens..._' : '')}</ReactMarkdown>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    background: 'var(--white)',
    border: '1px solid var(--border-gold)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
    flexWrap: 'wrap',
    gap: 8,
  },
  barLabel: {
    color: 'var(--gold-light)',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  barActions: { display: 'flex', gap: 8 },
  copyBtn: {
    padding: '6px 14px',
    background: 'var(--gold)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.1)',
    color: 'var(--white)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
  },
  content: {
    padding: '28px 28px 32px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
}

import { useEffect, useState } from 'react'
import PageLayout from '../shared/PageLayout'
import OutputViewer from '../shared/OutputViewer'
import { historyApi } from '../../services/api'
import { FEATURE_LABELS } from '../shared/GenerationMeta'

const FEATURE_FILTERS = [
  { value: '', label: 'All features' },
  ...Object.entries(FEATURE_LABELS)
    .filter(([key]) => key !== 'evaluation')
    .map(([value, label]) => ({ value, label })),
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function HistoryPage() {
  const [filter, setFilter] = useState('')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadList(feature = filter) {
    setLoading(true)
    setError('')
    try {
      const data = await historyApi.list(feature || undefined)
      setItems(data.items || [])
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  async function handleFilterChange(e) {
    const value = e.target.value
    setFilter(value)
    setSelected(null)
    await loadList(value)
  }

  async function openItem(id) {
    setDetailLoading(true)
    setError('')
    try {
      const data = await historyApi.get(id)
      setSelected(data.item)
    } catch (err) {
      setError(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function removeItem(id) {
    if (!window.confirm('Delete this saved generation?')) return
    try {
      await historyApi.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function clearAll() {
    if (!window.confirm('Delete all saved generations? This cannot be undone.')) return
    try {
      await historyApi.removeAll()
      setItems([])
      setSelected(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (selected) {
    return (
      <PageLayout
        title={selected.title || FEATURE_LABELS[selected.feature] || 'Generation'}
        subtitle={`${FEATURE_LABELS[selected.feature] || selected.feature} · ${formatDate(selected.createdAt)}`}
        icon="📋"
      >
        <button type="button" onClick={() => setSelected(null)} style={styles.backLink}>
          ← Back to history
        </button>
        <OutputViewer
          content={selected.content}
          meta={{
            model: selected.model,
            ragUsed: selected.ragUsed,
            fallbackUsed: selected.fallbackUsed,
            evaluation: selected.evaluation,
          }}
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Generation History"
      subtitle="Review, reopen, or delete past AI outputs."
      icon="📋"
    >
      <div style={styles.toolbar}>
        <select value={filter} onChange={handleFilterChange} style={styles.select}>
          {FEATURE_FILTERS.map(opt => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {items.length > 0 && (
          <button type="button" onClick={clearAll} style={styles.clearBtn}>
            Clear all
          </button>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p style={styles.muted}>Loading history…</p>}
      {!loading && !items.length && !error && (
        <p style={styles.muted}>No saved generations yet. Generate content from any feature to see it here.</p>
      )}

      <ul style={styles.list}>
        {items.map(item => (
          <li key={item.id} style={styles.item}>
            <button type="button" onClick={() => openItem(item.id)} style={styles.itemMain}>
              <span style={styles.itemTitle}>{item.title}</span>
              <span style={styles.itemMeta}>
                {FEATURE_LABELS[item.feature] || item.feature} · {formatDate(item.createdAt)}
              </span>
              {item.preview && <span style={styles.preview}>{item.preview}…</span>}
            </button>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              style={styles.deleteBtn}
              aria-label="Delete"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {detailLoading && <p style={styles.muted}>Loading…</p>}
    </PageLayout>
  )
}

const styles = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    fontSize: 14,
    background: 'var(--white)',
    minWidth: 180,
  },
  clearBtn: {
    background: 'none',
    border: '1px solid #FCA5A5',
    color: '#DC2626',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--gold-dim)',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 16,
    padding: 0,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  item: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 8,
    background: 'var(--white)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  itemMain: {
    flex: 1,
    textAlign: 'left',
    padding: '16px 18px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--navy)',
    fontFamily: 'var(--font-serif)',
  },
  itemMeta: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  preview: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginTop: 4,
  },
  deleteBtn: {
    alignSelf: 'center',
    marginRight: 12,
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  error: {
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    color: '#DC2626',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 16,
  },
  muted: {
    fontSize: 14,
    color: 'var(--text-muted)',
  },
}

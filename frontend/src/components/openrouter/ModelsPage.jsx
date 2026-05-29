import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { modelsApi } from '../../services/api'
import { FEATURE_LABELS, formatModel } from '../shared/GenerationMeta'

export default function ModelsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    modelsApi.list()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleTestAll() {
    setTesting(true)
    setTestResult(null)
    setError('')
    try {
      setTestResult(await modelsApi.test())
    } catch (err) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  const testByModel = testResult?.results
    ? Object.fromEntries(testResult.results.map(r => [r.model, r]))
    : {}

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <button type="button" onClick={() => navigate('/')} style={s.backBtn}>Dashboard</button>
      </nav>
      <main style={s.main}>
        <header style={s.header}>
          <span style={s.icon}>AI</span>
          <div>
            <h1 style={s.title}>OpenRouter Models</h1>
            <p style={s.sub}>Per-feature routing with automatic fallbacks when a provider is unavailable.</p>
          </div>
        </header>
        {error && <p style={s.error}>{error}</p>}
        {loading ? (
          <p style={s.muted}>Loading...</p>
        ) : data && (
          <>
            <section style={s.section}>
              <div style={s.sectionHead}>
                <h2 style={s.h2}>Feature routing</h2>
                <button type="button" onClick={handleTestAll} disabled={testing} style={s.testBtn}>
                  {testing ? 'Testing...' : 'Test all models'}
                </button>
              </div>
              {testResult && (
                <p style={s.muted}>
                  {testResult.summary.passed}/{testResult.summary.total} reachable
                  {testResult.summary.failed > 0 && ` (${testResult.summary.failed} failed)`}
                </p>
              )}
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Feature</th>
                      <th style={s.th}>Primary</th>
                      <th style={s.th}>Fallback</th>
                      <th style={s.th}>Test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.features.map(row => (
                      <tr key={row.feature}>
                        <td style={s.td}>
                          <strong>{FEATURE_LABELS[row.feature] || row.feature}</strong>
                          <div style={s.chain}>{row.chain.join(' -> ')}</div>
                        </td>
                        <td style={s.tdMono}>{formatModel(row.primary)}</td>
                        <td style={s.tdMono}>{formatModel(row.fallback)}</td>
                        <td style={s.td}>
                          {testResult ? (
                            <span>
                              <Dot ok={testByModel[row.primary]?.ok} />{' '}
                              <Dot ok={testByModel[row.fallback]?.ok} />
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section style={s.section}>
              <h2 style={s.h2}>Models in use</h2>
              <div style={s.grid}>
                {data.models.map(m => {
                  const t = testByModel[m.id]
                  return (
                    <div key={m.id} style={s.card}>
                      <code style={s.code}>{m.id}</code>
                      {testResult && (
                        <span style={{ ...s.pill, ...(t?.ok ? s.pillOk : s.pillFail) }}>
                          {t?.ok ? `${t.elapsedMs}ms` : 'fail'}
                        </span>
                      )}
                      <p style={s.used}>Used by: {m.usedBy.map(f => FEATURE_LABELS[f] || f).join(', ')}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Dot({ ok }) {
  const bg = ok === undefined ? '#E5E7EB' : ok ? '#D1FAE5' : '#FEE2E2'
  const color = ok === undefined ? '#9CA3AF' : ok ? '#065F46' : '#991B1B'
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: bg, border: `2px solid ${color}` }} />
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 60 },
  nav: { padding: '14px 28px', background: 'var(--white)', borderBottom: '1px solid var(--border)' },
  backBtn: { background: 'none', border: 'none', color: 'var(--gold-dim)', fontSize: 14, cursor: 'pointer' },
  main: { maxWidth: 960, margin: '0 auto', padding: '32px 28px' },
  header: { display: 'flex', gap: 16, marginBottom: 32 },
  icon: { fontSize: 32, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-serif)' },
  title: { fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--navy)' },
  sub: { fontSize: 14, color: 'var(--text-muted)', marginTop: 4 },
  section: { marginBottom: 36 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  h2: { fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--navy)', marginBottom: 12 },
  testBtn: { padding: '10px 18px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  tableWrap: { overflowX: 'auto', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '12px 16px', background: 'var(--cream)', fontSize: 11, textTransform: 'uppercase', color: 'var(--gold-dim)' },
  td: { padding: '14px 16px', borderTop: '1px solid var(--border)', verticalAlign: 'top' },
  tdMono: { padding: '14px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' },
  chain: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 },
  code: { fontSize: 11, display: 'block', marginBottom: 6, wordBreak: 'break-all' },
  pill: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 },
  pillOk: { background: '#D1FAE5', color: '#065F46' },
  pillFail: { background: '#FEE2E2', color: '#991B1B' },
  used: { fontSize: 12, color: 'var(--text-muted)', marginTop: 6 },
  error: { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: 12, borderRadius: 8, marginBottom: 16 },
  muted: { color: 'var(--text-muted)', fontSize: 14 },
}

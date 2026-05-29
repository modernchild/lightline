const fs = require("fs");
const path = require("path");
const base = "C:/Users/LONGJI SATI/Desktop/demo/lightline/lightline-app/frontend/src";

function write(rel, content) {
  const full = path.join(base, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

write("components/shared/OutputViewer.jsx", `// src/components/shared/OutputViewer.jsx
// Renders streamed markdown output with OpenRouter metadata
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import GenerationMeta from './GenerationMeta'

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

      <GenerationMeta meta={meta} streaming={streaming} />

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
`);


write("components/shared/GenerationMeta.jsx", `// GenerationMeta
const SCORE_DIMS = [
  { key: "scripture", label: "Scripture" },
  { key: "relevance", label: "Relevance" },
  { key: "usability", label: "Usability" },
  { key: "clarity", label: "Clarity" },
];
export const FEATURE_LABELS = {
  sermon: "Sermon", devotional: "Devotional", whatsapp: "WhatsApp",
  social: "Social Media", "bible-study": "Bible Study", prayer: "Prayer",
  evangelism: "Evangelism", evaluation: "Evaluation",
};
export function formatModel(id) {
  if (!id) return "Unknown";
  const slash = id.indexOf("/");
  if (slash === -1) return id;
  return id.slice(0, slash) + " / " + id.slice(slash + 1).replace(/-/g, " ");
}
function scoreColor(n) {
  if (n >= 8) return "var(--gold)";
  if (n >= 6) return "var(--navy-mid)";
  return "#B45309";
}
export default function GenerationMeta({ meta, streaming }) {
  if (!meta && !streaming) return null;
  const scores = meta?.evaluation?.scores;
  return (
    <div style={styles.wrap}>
      <div style={styles.badges}>
        {streaming && <span style={{ ...styles.badge, ...styles.badgeStream }}><span style={styles.pulse} /> Generating via OpenRouter...</span>}
        {meta?.model && <span style={styles.badge} title={meta.model}>Model: {formatModel(meta.model)}</span>}
        {meta?.fallbackUsed && <span style={{ ...styles.badge, ...styles.badgeWarn }}>Fallback model used</span>}
        {meta?.ragUsed && <span style={{ ...styles.badge, ...styles.badgeRag }}>Ministry knowledge (RAG)</span>}
      </div>
      {scores && (
        <div style={styles.eval}>
          <div style={styles.evalHeader}>
            <span style={styles.evalTitle}>Content quality</span>
            <span style={styles.overall}>{scores.overall}<span style={styles.overallOf}>/10</span></span>
          </div>
          {meta.evaluation?.summary && <p style={styles.evalSummary}>{meta.evaluation.summary}</p>}
          <div style={styles.bars}>
            {SCORE_DIMS.map(({ key, label }) => (
              <div key={key} style={styles.barRow}>
                <span style={styles.barLabel}>{label}</span>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: (scores[key] * 10) + "%", background: scoreColor(scores[key]) }} /></div>
                <span style={styles.barScore}>{scores[key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  wrap: { padding: "14px 20px", background: "var(--cream)", borderBottom: "1px solid var(--border)" },
  badges: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  badge: { fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 100, background: "var(--white)", border: "1px solid var(--border)", color: "var(--navy-mid)" },
  badgeStream: { background: "var(--navy)", borderColor: "var(--navy)", color: "var(--gold-light)", display: "inline-flex", alignItems: "center", gap: 8 },
  badgeWarn: { background: "#FEF3C7", borderColor: "#FCD34D", color: "#92400E" },
  badgeRag: { background: "#ECFDF5", borderColor: "#6EE7B7", color: "#065F46" },
  pulse: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1.2s ease-in-out infinite" },
  eval: { marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-gold)" },
  evalHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  evalTitle: { fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold-dim)" },
  overall: { fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 600, color: "var(--navy)" },
  overallOf: { fontSize: 13, color: "var(--text-muted)", fontWeight: 400 },
  evalSummary: { fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 },
  bars: { display: "flex", flexDirection: "column", gap: 8 },
  barRow: { display: "grid", gridTemplateColumns: "72px 1fr 24px", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 11, color: "var(--text-muted)" },
  barTrack: { height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3, transition: "width 400ms ease" },
  barScore: { fontSize: 12, fontWeight: 600, color: "var(--navy)", textAlign: "right" },
};
`);

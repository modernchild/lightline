// GenerationMeta
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

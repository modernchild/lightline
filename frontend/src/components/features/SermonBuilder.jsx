// src/components/features/SermonBuilder.jsx
import { useState } from 'react'
import PageLayout from '../shared/PageLayout'
import OutputViewer from '../shared/OutputViewer'
import { Field, Input, Textarea, Select } from '../shared/FormField'
import { generateApi } from '../../services/api'

const DEEP_STEPS = [
  { value: 'exegesis',      label: '1. Exegesis — Study the text' },
  { value: 'outline',       label: '2. Outline — Structure the message' },
  { value: 'illustrations', label: '3. Illustrations — Stories & analogies' },
  { value: 'application',   label: '4. Application — Practical response' },
  { value: 'fullDraft',     label: '5. Full Draft — Complete manuscript' },
]

export default function SermonBuilder() {
  const [mode, setMode]             = useState('quick') // 'quick' | 'deep'
  const [form, setForm]             = useState({ topic: '', scripture: '', occasion: '', duration: '', context: '' })
  const [deepStep, setDeepStep]     = useState('exegesis')
  const [deepStepsData, setDeepStepsData] = useState({}) // { exegesis: content, outline: content, ... }
  const [customPrompt, setCustomPrompt] = useState('') // User refinement/follow-up
  const [currentOutput, setCurrentOutput] = useState('')
  const [currentMeta, setCurrentMeta] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [hasStartedDeep, setHasStartedDeep] = useState(false)
  const [showStepsPanel, setShowStepsPanel] = useState(false) // Mobile: toggle sidebar
  const [showRefine, setShowRefine] = useState(false) // Mobile: toggle refinement

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.topic.trim()) { setError('Please enter a topic or scripture.'); return }
    setLoading(true)
    setError('')
    setCurrentOutput('')
    setCurrentMeta(null)
    try {
      let data
      if (mode === 'quick') {
        data = await generateApi.sermonQuick(form, {
          onChunk: (chunk) => setCurrentOutput(prev => prev + chunk),
        })
      } else {
        // Deep mode - build previous steps context
        const previousStepsContent = DEEP_STEPS
          .slice(0, DEEP_STEPS.findIndex(s => s.value === deepStep))
          .map(s => `### ${s.label}\n${deepStepsData[s.value] || ''}`)
          .join('\n\n')
        
        data = await generateApi.sermonDeep({
          step: deepStep,
          topic: form.topic,
          scripture: form.scripture,
          occasion: form.occasion,
          customPrompt, // Include user refinement
          previousSteps: previousStepsContent,
        }, { onChunk: (chunk) => setCurrentOutput(prev => prev + chunk) })
        
        // Store this step's result
        setDeepStepsData(prev => ({
          ...prev,
          [deepStep]: data.content,
        }))
        setCustomPrompt('') // Clear prompt after use
        setHasStartedDeep(true)
      }
      setCurrentOutput(data.content)
      setCurrentMeta(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleResetAll() {
    setDeepStepsData({})
    setCurrentOutput('')
    setCurrentMeta(null)
    setError('')
    setCustomPrompt('')
    setHasStartedDeep(false)
    setDeepStep('exegesis')
  }

  function handleNextStep() {
    const currentIdx = DEEP_STEPS.findIndex(s => s.value === deepStep)
    const next = DEEP_STEPS[currentIdx + 1]
    if (next) {
      setDeepStep(next.value)
      setCurrentOutput('')
      setCurrentMeta(null)
      setCustomPrompt('')
    }
  }

  function handlePreviousStep() {
    const currentIdx = DEEP_STEPS.findIndex(s => s.value === deepStep)
    if (currentIdx > 0) {
      setDeepStep(DEEP_STEPS[currentIdx - 1].value)
      setCurrentOutput('')
      setCurrentMeta(null)
      setCustomPrompt('')
    }
  }

  function handleRegenerateStep() {
    setCurrentOutput('')
    setCurrentMeta(null)
    setCustomPrompt('')
    // Re-submit to regenerate current step
    const form_copy = form
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true })
      document.querySelector('form')?.dispatchEvent(event)
    }, 0)
  }

  return (
    <PageLayout
      title="Sermon Builder"
      subtitle="From blank page to pulpit-ready — your way."
      icon="📖"
    >
      {/* Mode toggle */}
      <div className="feature-mode-tabs">
        <button
          onClick={() => { setMode('quick'); handleResetAll() }}
          className={`feature-mode-tabs__btn${mode === 'quick' ? ' feature-mode-tabs__btn--active' : ''}`}
        >
          ⚡ Quick Delivery
        </button>
        <button
          onClick={() => { setMode('deep'); handleResetAll() }}
          className={`feature-mode-tabs__btn${mode === 'deep' ? ' feature-mode-tabs__btn--active' : ''}`}
        >
          🏗 Deep Preparation
        </button>
      </div>

      {mode === 'quick' && (
        <p className="feature-mode-tabs__desc">
          Get a complete, structured, ready-to-preach sermon in one step.
        </p>
      )}
      {mode === 'deep' && (
        <p className="feature-mode-tabs__desc">
          Work through your sermon step by step. Each step builds on the last. Refine as you go.
        </p>
      )}

      {mode === 'quick' ? (
        // QUICK MODE — Standard form + output
        <>
          {!currentOutput ? (
            <form onSubmit={handleSubmit} className="feature-form">
              <Field label="Topic or Title *" hint="e.g. The Grace of God, Walking in Faith, Identity in Christ">
                <Input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Enter your sermon topic or title"
                  required
                />
              </Field>

              <Field label="Primary Scripture" hint="Optional — leave blank to let us suggest one">
                <Input
                  name="scripture"
                  value={form.scripture}
                  onChange={handleChange}
                  placeholder="e.g. Romans 8:28, John 3:16, Ephesians 2:8-9"
                />
              </Field>

              <div className="feature-form__row">
                <Field label="Occasion" hint="Sunday service, midweek, conference…">
                  <Input
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                    placeholder="Sunday morning service"
                  />
                </Field>
                <Field label="Duration" hint="How long will you preach?">
                  <Select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="Select duration"
                    options={['15 minutes', '20 minutes', '30 minutes', '45 minutes', '60 minutes']}
                  />
                </Field>
              </div>

              <Field label="Additional Context" hint="Congregation background, specific emphasis, or any notes">
                <Textarea
                  name="context"
                  value={form.context}
                  onChange={handleChange}
                  placeholder="e.g. Congregation is going through a season of testing. Emphasise God's faithfulness."
                  rows={3}
                />
              </Field>

              {error && <p className="feature-form__error">{error}</p>}

              <button type="submit" className="feature-form__submit" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <Spinner /> Preparing your sermon…
                  </span>
                ) : '⚡ Generate Sermon'}
              </button>
            </form>
          ) : (
            <div>
              <OutputViewer content={currentOutput} meta={currentMeta} streaming={loading} />
              <div className="feature-form__actions">
                <button onClick={() => { setCurrentOutput(''); setCurrentMeta(null); setError('') }} className="feature-form__reset">
                  ← Start Over
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // DEEP MODE — Multi-step interactive interface
        <>
          {!hasStartedDeep ? (
            // Initial setup form
            <form onSubmit={handleSubmit} className="feature-form">
              <Field label="Topic or Title *" hint="e.g. The Grace of God, Walking in Faith, Identity in Christ">
                <Input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Enter your sermon topic or title"
                  required
                />
              </Field>

              <Field label="Primary Scripture" hint="Optional — leave blank to let us suggest one">
                <Input
                  name="scripture"
                  value={form.scripture}
                  onChange={handleChange}
                  placeholder="e.g. Romans 8:28, John 3:16, Ephesians 2:8-9"
                />
              </Field>

              <div className="feature-form__row">
                <Field label="Occasion" hint="Sunday service, midweek, conference…">
                  <Input
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                    placeholder="Sunday morning service"
                  />
                </Field>
                <Field label="Duration" hint="How long will you preach?">
                  <Select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="Select duration"
                    options={['15 minutes', '20 minutes', '30 minutes', '45 minutes', '60 minutes']}
                  />
                </Field>
              </div>

              {error && <p className="feature-form__error">{error}</p>}

              <button type="submit" className="feature-form__submit" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <Spinner /> Starting deep preparation…
                  </span>
                ) : '🚀 Begin Deep Preparation'}
              </button>
            </form>
          ) : (
            // Multi-step progression interface
            <div className="sermon-deep-container">
              {/* Mobile toggle for steps panel */}
              <button 
                onClick={() => setShowStepsPanel(!showStepsPanel)}
                className="sermon-deep-mobile-toggle"
                aria-label="Toggle preparation steps"
              >
                📋 {showStepsPanel ? 'Hide' : 'Show'} Steps
              </button>

              {/* Left sidebar: Step progress */}
              <div className={`sermon-deep-progress${showStepsPanel ? ' sermon-deep-progress--open' : ''}`}>
                <h3>Preparation Steps</h3>
                <div className="sermon-deep-steps">
                  {DEEP_STEPS.map((step, idx) => {
                    const isCompleted = deepStepsData[step.value]
                    const isActive = deepStep === step.value
                    return (
                      <button
                        key={step.value}
                        onClick={() => setDeepStep(step.value)}
                        className={`sermon-deep-step${isActive ? ' sermon-deep-step--active' : ''}${isCompleted ? ' sermon-deep-step--completed' : ''}`}
                        disabled={!isCompleted && !isActive}
                        title={step.label}
                      >
                        <span className="sermon-deep-step-num">{idx + 1}</span>
                        <span className="sermon-deep-step-label">{step.label}</span>
                        {isCompleted && <span className="sermon-deep-step-check">✓</span>}
                      </button>
                    )
                  })}
                </div>
                <button onClick={handleResetAll} className="sermon-deep-reset">
                  ↻ Start Over
                </button>
              </div>

              {/* Main content area */}
              <div className="sermon-deep-main">
                {/* Current step header */}
                <div className="sermon-deep-header">
                  <div>
                    <h2>{DEEP_STEPS.find(s => s.value === deepStep)?.label}</h2>
                    <p className="sermon-deep-topic">Topic: <strong>{form.topic}</strong></p>
                  </div>
                  {deepStepsData[deepStep] && (
                    <button onClick={handleRegenerateStep} className="sermon-deep-regen" title="Regenerate this step">
                      🔄
                    </button>
                  )}
                </div>

                {/* Previous steps summary (collapsible) */}
                {Object.keys(deepStepsData).length > 0 && (
                  <details className="sermon-deep-previous">
                    <summary>📋 Previous Steps</summary>
                    <div className="sermon-deep-previous-list">
                      {DEEP_STEPS.map(step => 
                        deepStepsData[step.value] && (
                          <div key={step.value} className="sermon-deep-previous-item">
                            <h4>{step.label}</h4>
                            <p>{deepStepsData[step.value].substring(0, 150)}...</p>
                          </div>
                        )
                      )}
                    </div>
                  </details>
                )}

                {/* Current step output */}
                <div className="sermon-deep-output">
                  {currentOutput ? (
                    <OutputViewer content={currentOutput} meta={currentMeta} streaming={loading} />
                  ) : (
                    <div className="sermon-deep-empty">
                      <p>Generate content for this step to continue.</p>
                    </div>
                  )}
                </div>

                {/* Refinement prompt */}
                {currentOutput && !loading && (
                  <div className="sermon-deep-refine-section">
                    {/* Mobile: Show/hide refinement toggle */}
                    <button 
                      onClick={() => setShowRefine(!showRefine)}
                      className="sermon-deep-refine-toggle"
                      aria-label="Toggle refinement section"
                    >
                      ✎ {showRefine ? 'Hide' : 'Refine'} (Optional)
                    </button>
                    
                    {/* Refinement content (always visible on desktop, toggleable on mobile) */}
                    {showRefine && (
                      <div className="sermon-deep-refine">
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="e.g. Make it more concise, add more scholarly references, focus on application..."
                          rows={2}
                        />
                        <button onClick={handleSubmit} className="sermon-deep-refine-btn" disabled={loading || !customPrompt.trim()}>
                          🔄 Refine Content
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Error message */}
                {error && <p className="feature-form__error">{error}</p>}

                {/* Action buttons */}
                <div className="sermon-deep-nav">
                  <button 
                    onClick={handlePreviousStep} 
                    className="sermon-deep-nav-btn sermon-deep-nav-prev"
                    disabled={deepStep === 'exegesis'}
                  >
                    ← Previous Step
                  </button>

                  <button 
                    onClick={handleSubmit} 
                    className="sermon-deep-nav-btn sermon-deep-nav-generate"
                    disabled={loading || !form.topic}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Spinner /> Generating…
                      </span>
                    ) : currentOutput ? (
                      <>🔄 Regenerate</>
                    ) : (
                      <>→ Generate {DEEP_STEPS.find(s => s.value === deepStep)?.label.split('—')[0]}...</>
                    )}
                  </button>

                  <button 
                    onClick={handleNextStep} 
                    className="sermon-deep-nav-btn sermon-deep-nav-next"
                    disabled={!currentOutput || loading || deepStep === 'fullDraft'}
                  >
                    {deepStep === 'fullDraft' ? '✓ Complete' : 'Next Step →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}




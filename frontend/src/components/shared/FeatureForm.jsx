// src/components/shared/FeatureForm.jsx
import { useState } from 'react'
import OutputViewer from './OutputViewer'
import { Field, Input, Textarea, Select } from './FormField'

export default function FeatureForm({
  fields,
  onGenerate,
  submitLabel = 'Generate',
  enableMemory = false,
}) {
  const initialValues = Object.fromEntries(fields.map(f => [f.name, '']))
  const [form, setForm] = useState(initialValues)
  const [output, setOutput] = useState('')
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useMemory, setUseMemory] = useState(false)
  const [evaluate, setEvaluate] = useState(true)
  const [conversationId, setConversationId] = useState(null)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleReset() {
    setOutput('')
    setMeta(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOutput('')
    setMeta(null)
    try {
      const data = await onGenerate(form, {
        onChunk: (chunk) => setOutput(prev => prev + chunk),
        useMemory: enableMemory && useMemory,
        conversationId,
        evaluate,
      })
      setOutput(data.content)
      setMeta(data)
      if (data.conversationId) setConversationId(data.conversationId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || output) {
    return (
      <OutputViewer
        content={output}
        meta={meta}
        streaming={loading}
        onReset={loading ? undefined : handleReset}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="feature-form">
      {fields.map(field => (
        <Field key={field.name} label={field.label} hint={field.hint}>
          {field.type === 'textarea' ? (
            <Textarea
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <Select
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              options={field.options}
              placeholder={field.placeholder}
            />
          ) : (
            <Input
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
        </Field>
      ))}

      <div className="feature-form__options">
        <label className="feature-form__check">
          <input
            type="checkbox"
            checked={evaluate}
            onChange={e => setEvaluate(e.target.checked)}
          />
          Score content quality (OpenRouter evaluator)
        </label>
        {enableMemory && (
          <label className="feature-form__check">
            <input
              type="checkbox"
              checked={useMemory}
              onChange={e => setUseMemory(e.target.checked)}
            />
            Continue conversation (remember prior turns)
          </label>
        )}
      </div>

      {error && <p className="feature-form__error">{error}</p>}

      <button type="submit" className="feature-form__submit">{submitLabel}</button>
    </form>
  )
}
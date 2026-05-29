// src/components/features/EvangelismCompanion.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  {
    name: 'context',
    label: 'Outreach Context',
    type: 'select',
    placeholder: 'Select context',
    options: [
      { value: 'street', label: 'Street / Open-air evangelism' },
      { value: 'one-on-one', label: 'One-on-one conversation' },
      { value: 'workplace', label: 'Workplace outreach' },
      { value: 'campus', label: 'Campus / School outreach' },
      { value: 'crusade', label: 'Crusade / Large event' },
      { value: 'followup', label: 'Follow-up with interested person' },
    ],
  },
  { name: 'audience', label: 'Target Audience', type: 'input', placeholder: 'e.g. Young adults, Market traders, University students, Unchurched parents' },
  {
    name: 'format',
    label: 'Format',
    type: 'select',
    placeholder: 'Select format',
    options: [
      { value: 'verbal', label: 'Verbal Gospel presentation (3—5 minutes)' },
      { value: 'tract', label: 'Tract / Written summary' },
      { value: 'testimony', label: 'Testimony bridge approach' },
      { value: 'social', label: 'Social media Gospel post' },
    ],
  },
]

export default function EvangelismCompanion() {
  return (
    <PageLayout
      title="Evangelism Companion"
      subtitle="Clear, compelling Gospel presentations for every outreach context."
      icon="✝️"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.evangelism(form, opts)}
        submitLabel="✝️ Generate Outreach Script"
      />
    </PageLayout>
  )
}


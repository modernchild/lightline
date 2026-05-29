// src/components/features/Devotional.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  { name: 'topic', label: 'Theme or Topic *', type: 'input', placeholder: 'e.g. Trusting God in uncertainty, The peace of God', required: true },
  { name: 'scripture', label: 'Scripture Reference', type: 'input', placeholder: 'e.g. Philippians 4:6-7, Isaiah 26:3', hint: 'Optional — leave blank to suggest one' },
  { name: 'audience', label: 'Audience', type: 'input', placeholder: 'e.g. New believers, Working mothers, Youth group', hint: 'Who will read this devotional?' },
  {
    name: 'length',
    label: 'Type',
    type: 'select',
    placeholder: 'Select type',
    options: [
      { value: 'daily', label: 'Daily Devotional' },
      { value: 'weekly', label: 'Weekly Devotional' },
      { value: 'extended', label: 'Extended Study Devotional' },
    ],
  },
]

export default function Devotional() {
  return (
    <PageLayout
      title="Devotional Writer"
      subtitle="Scripture-grounded devotionals that nourish and encourage."
      icon="🕊️"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.devotional(form, opts)}
        submitLabel="✦ Write Devotional"
      />
    </PageLayout>
  )
}

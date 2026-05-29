// src/components/features/PrayerGenerator.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  { name: 'topic', label: 'Prayer Focus *', type: 'input', placeholder: 'e.g. Healing, Financial breakthrough, National leadership, A new season', required: true },
  {
    name: 'type',
    label: 'Prayer Type',
    type: 'select',
    placeholder: 'Select type',
    options: [
      { value: 'corporate', label: 'Corporate — congregation prays together' },
      { value: 'intercession', label: 'Intercession — praying for others' },
      { value: 'declaration', label: 'Declaration — faith declarations' },
      { value: 'personal', label: 'Personal — individual private prayer' },
      { value: 'opening', label: 'Opening Prayer — for a service' },
      { value: 'closing', label: 'Closing / Benediction' },
    ],
  },
  { name: 'audience', label: 'Who Will Pray This?', type: 'input', placeholder: 'e.g. Full congregation, Men\'s group, Leaders, Individual' },
  {
    name: 'length',
    label: 'Length',
    type: 'select',
    placeholder: 'Select length',
    options: [
      { value: 'short', label: 'Short (under 1 minute)' },
      { value: 'medium', label: 'Medium (2—3 minutes)' },
      { value: 'long', label: 'Long (5+ minutes)' },
    ],
  },
]

export default function PrayerGenerator() {
  return (
    <PageLayout
      title="Prayer & Declaration Generator"
      subtitle="Targeted, scripture-grounded prayers for every ministry need."
      icon="🙏"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.prayer(form, opts)}
        submitLabel="🙏 Generate Prayer"
      />
    </PageLayout>
  )
}


// src/components/features/BibleStudy.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  { name: 'passage', label: 'Bible Passage or Book *', type: 'input', placeholder: 'e.g. Romans 8, The Sermon on the Mount (Matthew 5-7), Psalm 23', required: true },
  { name: 'theme', label: 'Central Theme', type: 'input', placeholder: 'e.g. Suffering and hope, The character of God, Walking in the Spirit', hint: 'Optional — clarifies the study focus' },
  {
    name: 'sessions',
    label: 'Number of Sessions',
    type: 'select',
    placeholder: 'Select sessions',
    options: ['1', '2', '3', '4', '5', '6'],
  },
  { name: 'audience', label: 'Group Audience', type: 'input', placeholder: 'e.g. New believers, Mixed adult group, Men\'s fellowship, Youth' },
]

export default function BibleStudy() {
  return (
    <PageLayout
      title="Bible Study Guide"
      subtitle="Structured, inductive study guides for groups and individuals."
      icon="📚"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.bibleStudy(form, opts)}
        submitLabel="📚 Generate Study Guide"
      />
    </PageLayout>
  )
}


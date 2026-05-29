// src/components/features/SocialMedia.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  { name: 'topic', label: 'Topic or Message *', type: 'input', placeholder: 'e.g. God\'s faithfulness, Easter Sunday, Midweek encouragement', required: true },
  { name: 'scripture', label: 'Scripture Reference', type: 'input', placeholder: 'e.g. Jeremiah 29:11, Proverbs 3:5-6', hint: 'Optional — anchors the post spiritually' },
  {
    name: 'platform',
    label: 'Platform',
    type: 'select',
    placeholder: 'Select platform',
    options: [
      { value: 'all', label: 'All Platforms (Instagram + Twitter + Facebook)' },
      { value: 'instagram', label: 'Instagram only' },
      { value: 'twitter', label: 'Twitter / X only' },
      { value: 'facebook', label: 'Facebook only' },
    ],
  },
  {
    name: 'count',
    label: 'Number of Posts',
    type: 'select',
    placeholder: 'Select count',
    options: ['1', '2', '3', '5'],
  },
]

export default function SocialMedia() {
  return (
    <PageLayout
      title="Social Media Content"
      subtitle="Shareable, scripture-grounded posts for every platform."
      icon="📱"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.social(form, opts)}
        submitLabel="📱 Generate Posts"
      />
    </PageLayout>
  )
}


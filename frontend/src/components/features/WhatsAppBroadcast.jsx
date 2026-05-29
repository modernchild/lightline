// src/components/features/WhatsAppBroadcast.jsx
import PageLayout from '../shared/PageLayout'
import FeatureForm from '../shared/FeatureForm'
import { generateApi } from '../../services/api'

const FIELDS = [
  { name: 'topic', label: 'Message Topic *', type: 'input', placeholder: 'e.g. Sunday service reminder, Midweek prayer night, Zone fasting announcement', required: true },
  { name: 'purpose', label: 'Purpose of This Broadcast', type: 'input', placeholder: 'e.g. Invite, Reminder, Encouragement, Instruction' },
  { name: 'audience', label: 'Audience', type: 'input', placeholder: 'e.g. Zone members, Cell leaders, Youth group, Full congregation' },
  {
    name: 'tone',
    label: 'Tone',
    type: 'select',
    placeholder: 'Select tone',
    options: [
      { value: 'warm', label: 'Warm and relational' },
      { value: 'official', label: 'Official and formal' },
      { value: 'urgent', label: 'Urgent and direct' },
      { value: 'celebratory', label: 'Celebratory and uplifting' },
    ],
  },
]

export default function WhatsAppBroadcast() {
  return (
    <PageLayout
      title="WhatsApp Broadcast Writer"
      subtitle="Mobile-first messages your congregation will actually read."
      icon="💬"
    >
      <FeatureForm
        fields={FIELDS}
        onGenerate={(form, opts) => generateApi.whatsapp(form, opts)}
        submitLabel="💬 Write Broadcast"
      />
    </PageLayout>
  )
}


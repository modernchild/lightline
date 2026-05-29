import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AppHeader from '../shared/AppHeader'
import TypewriterWelcome from '../shared/TypewriterWelcome'
import { getFirstName } from '../../utils/user'

const FEATURES = [
  { path: '/sermon', icon: '\u{1F4D6}', title: 'Sermon Builder', desc: 'Quick Delivery or Deep Preparation — from topic to pulpit-ready.', tag: 'Most used' },
  { path: '/whatsapp', icon: '\u{1F4AC}', title: 'WhatsApp Broadcast', desc: 'Broadcast messages for zone pastors and church communication.', tag: '' },
  { path: '/devotional', icon: '\u{1F54A}\uFE0F', title: 'Devotional Writer', desc: 'Daily and weekly devotionals grounded in scripture.', tag: '' },
  { path: '/social', icon: '\u{1F4F1}', title: 'Social Media Content', desc: 'Posts and captions for Instagram, Twitter/X, and Facebook.', tag: '' },
  { path: '/bible-study', icon: '\u{1F4DA}', title: 'Bible Study Guide', desc: 'Structured inductive study guides for groups and individuals.', tag: '' },
  { path: '/prayer', icon: '\u{1F64F}', title: 'Prayer & Declaration', desc: 'Intercessory prayers, declarations, and corporate prayers.', tag: '' },
  { path: '/evangelism', icon: '\u271D\uFE0F', title: 'Evangelism Companion', desc: 'Gospel presentations, outreach scripts, and follow-up messages.', tag: '' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, consumeWelcome } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (consumeWelcome()) setShowWelcome(true)
  }, [consumeWelcome])

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = getFirstName(user?.name)
  const welcomeText = `Welcome, ${name}!`

  return (
    <div className="dashboard">
      <AppHeader />

      {showWelcome && (
        <div className="dashboard__welcome-banner">
          <TypewriterWelcome
            text={welcomeText}
            onComplete={() => setTimeout(() => setShowWelcome(false), 400)}
          />
        </div>
      )}

      <main className="dashboard__main">
        <div className="dashboard__intro">
          <p className="dashboard__greeting">{timeGreeting}, {name}.</p>
          <h1 className="dashboard__title">What are you preparing today?</h1>
          <p className="dashboard__verse">
            "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
          </p>
        </div>

        <div className="dashboard__grid">
          {FEATURES.map((feature) => (
            <button
              key={feature.path}
              type="button"
              className="dashboard__card"
              onClick={() => navigate(feature.path)}
            >
              <div className="dashboard__card-top">
                <span className="dashboard__card-icon">{feature.icon}</span>
                {feature.tag && <span className="dashboard__tag">{feature.tag}</span>}
              </div>
              <h3 className="dashboard__card-title">{feature.title}</h3>
              <p className="dashboard__card-desc">{feature.desc}</p>
              <span className="dashboard__card-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

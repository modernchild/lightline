import './PrivacyPolicyModal.css'

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Privacy Policy</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section>
            <h3>Lightline — Privacy Policy</h3>
            <p>
              <strong>Effective Date:</strong> 1 June 2025
              <br />
              <strong>Last Updated:</strong> 1 June 2025
            </p>
          </section>

          <section>
            <h3>1. Introduction</h3>
            <p>
              Welcome to Lightline ("we," "our," or "us"). Lightline is an AI-powered ministry companion built to help pastors, preachers, and ministers prepare sermons, devotionals, prayers, and ministry content.
            </p>
            <p>
              This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have over your data. By creating an account or using Lightline, you agree to the practices described in this policy.
            </p>
            <p>If you do not agree with this policy, please do not use the application.</p>
          </section>

          <section>
            <h3>2. Who We Are</h3>
            <p>
              Lightline is operated as part of the AI Foundry programme, Qubators Global, Cohort 01. For questions about this policy or your data, contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@lightline.app</li>
              <li><strong>Programme:</strong> AI Foundry · Qubators Global</li>
            </ul>
          </section>

          <section>
            <h3>3. Information We Collect</h3>
            
            <h4>3.1 Information You Provide Directly</h4>
            <p>When you register and use Lightline, we collect:</p>
            <ul>
              <li><strong>Account information</strong> — your full name, email address, and hashed password (we never store your plain-text password)</li>
              <li><strong>Ministry content inputs</strong> — topics, scripture references, occasions, and other details you enter when generating content</li>
              <li><strong>Generated outputs</strong> — the AI-generated sermons, devotionals, prayers, and other content produced for you</li>
              <li><strong>Conversation history</strong> — your message history and follow-up questions within each feature session</li>
              <li><strong>Evaluations and feedback</strong> — star ratings and written feedback you submit on generated content</li>
            </ul>

            <h4>3.2 Information Collected Automatically</h4>
            <p>When you use Lightline, we automatically collect:</p>
            <ul>
              <li><strong>Usage data</strong> — which features you use, how often, and when</li>
              <li><strong>Technical data</strong> — IP address, browser type, device type, and operating system</li>
              <li><strong>Performance data</strong> — response times, error rates, and model usage logs</li>
              <li><strong>Token usage</strong> — the volume of AI tokens consumed per generation (for cost management)</li>
            </ul>

            <h4>3.3 Information We Do Not Collect</h4>
            <p>We do not collect:</p>
            <ul>
              <li>Payment card details (we do not process payments directly)</li>
              <li>Biometric data</li>
              <li>Location data beyond your IP address</li>
              <li>Data from your device's contacts, camera, or microphone</li>
              <li>Any data from minors — Lightline is intended for adult ministers and church leaders only</li>
            </ul>
          </section>

          <section>
            <h3>4. How We Use Your Information</h3>
            <p>We use the information we collect for the following purposes:</p>

            <h4>4.1 Providing the Service</h4>
            <ul>
              <li>Authenticating your account and maintaining your session</li>
              <li>Generating AI-powered ministry content based on your inputs</li>
              <li>Storing your generation history so you can retrieve past outputs</li>
              <li>Maintaining conversational memory to improve multi-turn interactions</li>
              <li>Enabling you to evaluate and rate generated content</li>
            </ul>

            <h4>4.2 Improving the Service</h4>
            <ul>
              <li>Analysing which features are most used and where outputs fall short</li>
              <li>Using aggregated, anonymised evaluation scores to improve our AI prompts</li>
              <li>Identifying and fixing errors, bugs, and performance issues</li>
              <li>Building and improving our ministry knowledge base (RAG system)</li>
            </ul>

            <h4>4.3 Communications</h4>
            <ul>
              <li>Sending essential service communications (account confirmation, security alerts)</li>
              <li>Responding to support requests or questions you submit</li>
              <li>Notifying you of significant changes to this policy or our terms</li>
            </ul>
            <p>We do not send marketing emails without your explicit consent, and you may opt out of non-essential communications at any time.</p>

            <h4>4.4 Legal Compliance</h4>
            <ul>
              <li>Complying with applicable laws and regulations</li>
              <li>Responding to lawful requests from authorities</li>
              <li>Enforcing our Terms of Conditions and protecting our rights</li>
            </ul>
          </section>

          <section>
            <h3>5. Data Storage and Security</h3>

            <h4>5.1 Where Data is Stored</h4>
            <ul>
              <li><strong>User accounts and generation history</strong> — stored in a SQLite database on our backend server hosted on Railway</li>
              <li><strong>Conversational memory</strong> — stored in the same database, linked to your user account</li>
              <li><strong>AI knowledge base</strong> — stored in Pinecone vector database on AWS infrastructure</li>
            </ul>

            <h4>5.2 Security Measures</h4>
            <ul>
              <li>Passwords are hashed using bcrypt with a work factor of 12 — your plain-text password is never stored</li>
              <li>All data in transit is encrypted using TLS 1.2 or higher</li>
              <li>JWT tokens expire after 7 days and must be renewed</li>
              <li>API rate limiting protects against brute-force attacks</li>
              <li>Environment variables and API keys are never committed to source code</li>
              <li>Access to production databases is restricted to authorised personnel only</li>
            </ul>
            <p>No system is completely secure. We cannot guarantee absolute security, but we are committed to protecting your information.</p>
          </section>

          <section>
            <h3>6. Your Rights and Choices</h3>
            <p>Depending on your location, you may have rights including:</p>
            <ul>
              <li><strong>Access</strong> — see what data we hold about you</li>
              <li><strong>Delete</strong> — remove individual or all generations</li>
              <li><strong>Export</strong> — request a copy of your data</li>
              <li><strong>Rectification</strong> — correct inaccurate personal data</li>
            </ul>
          </section>

          <section>
            <h3>7. Children's Privacy</h3>
            <p>
              Lightline is designed for adult ministers, pastors, and church leaders. We do not knowingly collect personal information from anyone under the age of 18.
            </p>
            <p>If you believe a child under 18 has created an account, please contact us at privacy@lightline.app.</p>
          </section>

          <section>
            <h3>8. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this document and display a notice within the application for material changes.
            </p>
          </section>

          <section>
            <h3>9. Contact Us</h3>
            <p>
              For questions, requests, or concerns about this Privacy Policy:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@lightline.app</li>
              <li><strong>Programme:</strong> AI Foundry · Qubators Global · Cohort 01</li>
            </ul>
            <p>We will respond to all verified requests within 30 days.</p>
          </section>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-button modal-button--primary">
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

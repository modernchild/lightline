import './TermsConditionsModal.css'

export default function TermsConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms and Conditions</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" title="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section>
            <h3>Lightline — Terms and Conditions</h3>
            <p>
              <strong>Effective Date:</strong> 1 June 2025
              <br />
              <strong>Last Updated:</strong> 1 June 2025
            </p>
          </section>

          <section>
            <h3>1. Agreement to These Terms</h3>
            <p>
              By accessing or using Lightline ("the Application," "we," "us," or "our"), you ("User," "you") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to all of these Terms, you may not access or use the Application.
            </p>
            <p>These Terms constitute a legally binding agreement between you and the Lightline team. Please read them carefully before creating an account.</p>
          </section>

          <section>
            <h3>2. Description of the Service</h3>
            <p>
              Lightline is an AI-powered ministry companion that helps pastors, preachers, and ministers prepare sermons, devotionals, prayers, Bible study guides, social media content, WhatsApp broadcast messages, and evangelism scripts.
            </p>
            <p>
              The Application uses artificial intelligence via third-party AI model providers (accessed through OpenRouter) to generate ministry content based on your inputs.
            </p>
            <p>Lightline is operated as part of the AI Foundry programme, Qubators Global, Cohort 01.</p>
          </section>

          <section>
            <h3>3. Eligibility</h3>
            
            <h4>3.1 Age Requirement</h4>
            <p>You must be at least 18 years of age to create an account and use Lightline. By registering, you confirm that you are 18 or older.</p>

            <h4>3.2 Intended Users</h4>
            <p>Lightline is designed specifically for:</p>
            <ul>
              <li>Ordained and licensed ministers, pastors, and preachers</li>
              <li>Church leaders and ministry team members</li>
              <li>Bible teachers and evangelists</li>
              <li>Students of theology and ministry</li>
            </ul>

            <h4>3.3 Organisational Use</h4>
            <p>
              If you are using Lightline on behalf of a church, ministry, or organisation, you represent that you have authority to bind that organisation to these Terms.
            </p>
          </section>

          <section>
            <h3>4. Account Registration and Security</h3>
            
            <h4>4.1 Accurate Information</h4>
            <p>You agree to provide accurate, current, and complete information when creating your account. You must promptly update your information if it changes.</p>

            <h4>4.2 Account Security</h4>
            <p>You are responsible for:</p>
            <ul>
              <li>Keeping your password confidential</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately at privacy@lightline.app if you suspect unauthorised access</li>
            </ul>
            <p>We are not liable for any loss or damage arising from your failure to keep your account credentials secure.</p>

            <h4>4.3 One Account Per Person</h4>
            <p>You may not create multiple accounts. Each account is for individual use only and may not be shared with others.</p>
          </section>

          <section>
            <h3>5. Acceptable Use</h3>
            
            <h4>5.1 Permitted Uses</h4>
            <p>You may use Lightline to:</p>
            <ul>
              <li>Generate sermon outlines, manuscripts, and teaching content for ministry use</li>
              <li>Create devotionals, prayers, and declarations for personal or congregational use</li>
              <li>Draft WhatsApp broadcast messages and social media posts for your ministry</li>
              <li>Create Bible study guides and evangelism scripts</li>
              <li>Store and review your generation history</li>
              <li>Evaluate and rate generated content</li>
            </ul>

            <h4>5.2 Prohibited Uses</h4>
            <p>You must not use Lightline to:</p>
            <ul>
              <li>Generate content that misrepresents Scripture or Christian doctrine for deceptive purposes</li>
              <li>Create content designed to mislead, manipulate, or exploit vulnerable individuals</li>
              <li>Produce content promoting heresy or cultic teachings</li>
              <li>Generate hate speech or discriminatory content</li>
              <li>Create content that sexualises minors or facilitates harm to children</li>
              <li>Attempt to reverse-engineer or circumvent security features</li>
              <li>Use automated scripts, bots, or crawlers to make bulk requests</li>
              <li>Attempt to access another user's account or data</li>
            </ul>

            <h4>5.3 Content Standards for Ministry Use</h4>
            <p>We expect all users to exercise pastoral and theological responsibility when using AI-generated content. Specifically:</p>
            <ul>
              <li>Always review, verify, and edit generated content before public delivery</li>
              <li>Confirm that all Scripture references are accurate before use</li>
              <li>Apply your own theological discernment — AI can make doctrinal errors</li>
              <li>Never present AI-generated content as direct divine revelation or prophecy</li>
              <li>Disclose AI assistance where appropriate in your ministry context</li>
            </ul>
          </section>

          <section>
            <h3>6. AI-Generated Content — Limitations</h3>
            
            <h4>6.1 No Guarantee of Theological Accuracy</h4>
            <p>
              <strong>You are solely responsible for verifying the theological accuracy, scriptural correctness, and doctrinal soundness of all content before using it in ministry.</strong>
            </p>

            <h4>6.2 Content Is a Starting Point</h4>
            <p>AI-generated content is intended to assist your preparation, not replace your pastoral judgment, study, and prayer. We strongly encourage you to treat all generated content as a first draft and personalise it to your congregation and context.</p>

            <h4>6.3 No Professional or Pastoral Advice</h4>
            <p>
              Lightline generates general ministry content. It does not constitute professional counselling, legal advice, medical advice, or authoritative theological rulings.
            </p>
          </section>

          <section>
            <h3>7. Intellectual Property</h3>
            
            <h4>7.1 Lightline's Intellectual Property</h4>
            <p>
              The Lightline Application, including its design, code, prompts, systems, and branding, is owned by the Lightline team. You may not copy, reproduce, or distribute the Application without our express written permission.
            </p>

            <h4>7.2 Your Content and Inputs</h4>
            <p>
              You retain ownership of the content you input into Lightline. By using the Application, you grant us a limited licence to process your inputs solely for the purpose of delivering the service to you.
            </p>

            <h4>7.3 Generated Outputs</h4>
            <p>
              Subject to these Terms, you own the content generated for you through Lightline. You may use generated content for your ministry purposes including preaching, teaching, publishing, and sharing.
            </p>
          </section>

          <section>
            <h3>8. Privacy</h3>
            <p>
              Your use of Lightline is also governed by our Privacy Policy. Please review our Privacy Policy carefully.
            </p>
          </section>

          <section>
            <h3>9. Termination</h3>
            <p>
              We may suspend or terminate your account if you violate any provision of these Terms or if your use poses a security risk or legal liability.
            </p>
          </section>

          <section>
            <h3>10. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any harm arising from your reliance on AI-generated content that contains theological errors or doctrinal misrepresentations.
            </p>
          </section>

          <section>
            <h3>11. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Lightline operates.
            </p>
          </section>

          <section>
            <h3>12. Contact Us</h3>
            <p>
              For questions about these Terms and Conditions:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@lightline.app</li>
              <li><strong>Programme:</strong> AI Foundry · Qubators Global · Cohort 01</li>
            </ul>
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

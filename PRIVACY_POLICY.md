# Lightline — Privacy Policy

**Effective Date:** 1 June 2025
**Last Updated:** 1 June 2025

---

## 1. Introduction

Welcome to Lightline ("we," "our," or "us"). Lightline is an AI-powered ministry companion built to help pastors, preachers, and ministers prepare sermons, devotionals, prayers, and ministry content.

This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have over your data. By creating an account or using Lightline, you agree to the practices described in this policy.

If you do not agree with this policy, please do not use the application.

---

## 2. Who We Are

Lightline is operated as part of the AI Foundry programme, Qubators Global, Cohort 01. For questions about this policy or your data, contact us at:

**Email:** privacy@lightline.app
**Programme:** AI Foundry · Qubators Global

---

## 3. Information We Collect

### 3.1 Information You Provide Directly

When you register and use Lightline, we collect:

- **Account information** — your full name, email address, and hashed password (we never store your plain-text password)
- **Ministry content inputs** — topics, scripture references, occasions, and other details you enter when generating content
- **Generated outputs** — the AI-generated sermons, devotionals, prayers, and other content produced for you
- **Conversation history** — your message history and follow-up questions within each feature session
- **Evaluations and feedback** — star ratings and written feedback you submit on generated content

### 3.2 Information Collected Automatically

When you use Lightline, we automatically collect:

- **Usage data** — which features you use, how often, and when
- **Technical data** — IP address, browser type, device type, and operating system
- **Performance data** — response times, error rates, and model usage logs
- **Token usage** — the volume of AI tokens consumed per generation (for cost management)

### 3.3 Information We Do Not Collect

We do not collect:

- Payment card details (we do not process payments directly)
- Biometric data
- Location data beyond your IP address
- Data from your device's contacts, camera, or microphone
- Any data from minors — Lightline is intended for adult ministers and church leaders only

---

## 4. How We Use Your Information

We use the information we collect for the following purposes:

### 4.1 Providing the Service

- Authenticating your account and maintaining your session
- Generating AI-powered ministry content based on your inputs
- Storing your generation history so you can retrieve past outputs
- Maintaining conversational memory to improve multi-turn interactions
- Enabling you to evaluate and rate generated content

### 4.2 Improving the Service

- Analysing which features are most used and where outputs fall short
- Using aggregated, anonymised evaluation scores to improve our AI prompts
- Identifying and fixing errors, bugs, and performance issues
- Building and improving our ministry knowledge base (RAG system)

### 4.3 Communications

- Sending essential service communications (account confirmation, security alerts)
- Responding to support requests or questions you submit
- Notifying you of significant changes to this policy or our terms

We do not send marketing emails without your explicit consent, and you may opt out of non-essential communications at any time.

### 4.4 Legal Compliance

- Complying with applicable laws and regulations
- Responding to lawful requests from authorities
- Enforcing our Terms of Conditions and protecting our rights

---

## 5. AI Processing and Third-Party Models

Lightline uses artificial intelligence to generate content. This involves sending your inputs to third-party AI providers. You should be aware of the following:

### 5.1 OpenRouter

Lightline routes AI generation requests through **OpenRouter** (https://openrouter.ai). OpenRouter acts as an intermediary that routes requests to the appropriate underlying model. Your inputs (topic, scripture reference, occasion, etc.) are transmitted to OpenRouter servers for processing.

OpenRouter's Privacy Policy: https://openrouter.ai/privacy

### 5.2 Underlying AI Models

Depending on the feature you use, your inputs may be processed by one or more of the following models:

| Feature | Primary Model | Provider |
|---------|--------------|----------|
| Sermon Builder | Claude Sonnet | Anthropic |
| Devotional Writer | Claude Sonnet | Anthropic |
| WhatsApp Broadcast | GPT-4o Mini | OpenAI |
| Social Media Content | Llama 3.1 70B | Meta / Together |
| Bible Study Guide | Claude Sonnet | Anthropic |
| Prayer & Declaration | Claude Sonnet | Anthropic |
| Evangelism Companion | Claude Sonnet | Anthropic |

Each provider has its own data processing terms. Key policies:

- **Anthropic** (Claude): https://www.anthropic.com/privacy
- **OpenAI** (GPT-4o): https://openai.com/policies/privacy-policy
- **Meta** (Llama via OpenRouter): https://www.meta.com/privacy

### 5.3 What We Send to AI Providers

We send only the content necessary to generate your requested output:

- Your system prompt context (feature type, ministry style)
- Your specific input (topic, scripture, occasion)
- Recent conversation history (if conversational memory is active)
- Relevant retrieved context from the knowledge base (RAG context)

We do not send your email address, account credentials, or personal identifying information to AI providers.

### 5.4 Pinecone (Vector Database)

For our Retrieval-Augmented Generation (RAG) feature, we use **Pinecone** to store and retrieve ministry knowledge. Query text derived from your inputs is sent to Pinecone for semantic search.

Pinecone's Privacy Policy: https://www.pinecone.io/privacy

---

## 6. Data Storage and Security

### 6.1 Where Data is Stored

- **User accounts and generation history** — stored in a SQLite database on our backend server hosted on Railway (https://railway.app)
- **Conversational memory** — stored in the same database, linked to your user account
- **AI knowledge base** — stored in Pinecone vector database on AWS infrastructure

### 6.2 How Long We Keep Your Data

| Data type | Retention period |
|-----------|-----------------|
| Account information | Until you delete your account |
| Generation history | Until you delete it or your account |
| Conversation memory | Until you clear it or delete your account |
| Evaluation scores | Until you delete your account |
| Server logs | 90 days, then automatically purged |
| Anonymised usage analytics | Up to 2 years |

### 6.3 Security Measures

We implement reasonable technical and organisational measures to protect your data:

- Passwords are hashed using bcrypt with a work factor of 12 — your plain-text password is never stored
- All data in transit is encrypted using TLS 1.2 or higher
- JWT tokens expire after 7 days and must be renewed
- API rate limiting protects against brute-force attacks
- Environment variables and API keys are never committed to source code
- Access to production databases is restricted to authorised personnel only

No system is completely secure. We cannot guarantee absolute security, but we are committed to protecting your information and will notify you promptly in the event of a material data breach.

---

## 7. Your Rights and Choices

Depending on your location, you may have the following rights regarding your personal data:

### 7.1 Rights Available to All Users

| Right | How to exercise it |
|-------|--------------------|
| **Access** — see what data we hold about you | Log in → History section shows all stored generations |
| **Delete history** — remove individual or all generations | Log in → History → Delete |
| **Clear memory** — remove conversational memory | Log in → any feature → Clear Memory |
| **Delete account** — remove all your data permanently | Email us at privacy@lightline.app |
| **Export** — request a copy of your data | Email us at privacy@lightline.app |

### 7.2 Additional Rights (GDPR — EEA/UK users)

If you are located in the European Economic Area or United Kingdom:

- **Right to rectification** — correct inaccurate personal data
- **Right to restriction** — limit how we process your data
- **Right to object** — object to processing based on legitimate interests
- **Right to portability** — receive your data in a machine-readable format
- **Right to lodge a complaint** — with your national supervisory authority

### 7.3 California Privacy Rights (CCPA)

If you are a California resident, you have the right to know what personal information we sell or disclose. We do not sell personal information to third parties. AI model providers receive your inputs as described in Section 5, but this is for service delivery, not sale.

---

## 8. Children's Privacy

Lightline is designed for adult ministers, pastors, and church leaders. We do not knowingly collect personal information from anyone under the age of 18.

If you believe a child under 18 has created an account, please contact us at privacy@lightline.app and we will promptly delete the account and associated data.

---

## 9. International Data Transfers

Lightline is operated globally. Your data may be processed in countries outside your own, including the United States, where our hosting providers and AI model providers are based.

Where required by law (e.g. GDPR), we rely on appropriate safeguards for international transfers, including standard contractual clauses and adequacy decisions.

---

## 10. Cookies and Tracking

The Lightline web application does not use advertising cookies or third-party tracking technologies. We use:

- **Session storage** — to maintain your login state within the browser session
- **Local storage** — to store your authentication token on your device

We do not use Google Analytics, Facebook Pixel, or any advertising trackers.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will:

- Update the "Last Updated" date at the top of this document
- Display a notice within the application for material changes
- Email registered users for significant changes

Continued use of Lightline after changes are posted constitutes acceptance of the updated policy.

---

## 12. Contact Us

For questions, requests, or concerns about this Privacy Policy:

**Email:** privacy@lightline.app
**Programme:** AI Foundry · Qubators Global · Cohort 01

We will respond to all verified requests within 30 days.

---

*This Privacy Policy was prepared for Lightline, an AI ministry companion. It is intended to be transparent, readable, and honest about how your data is handled.*

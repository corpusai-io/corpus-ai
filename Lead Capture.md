# New Feature: Smart Lead Capture

## Feature Overview

Lead Capture is a built-in capability within our chatbot widget that allows businesses to collect visitor contact information directly during a conversation. Unlike traditional static forms, our lead capture is **context-aware** — it captures not just a name and email, but the full picture of what the visitor was looking for, what they asked, and how interested they are.

This is one of the most requested features in the chatbot industry and a major reason businesses deploy chatbots in the first place. It transforms our product from a "question-answering tool" into a **lead generation engine**.

---

## Why This Feature Matters

When a visitor opens a chatbot on a client's website and starts asking questions, they are showing **buying intent**. They're actively interested in the product, service, or information. Right now, if that visitor closes the browser, that lead is lost forever — the business has no way to follow up.

With Smart Lead Capture, every meaningful conversation becomes a potential lead. The business doesn't just get an email address — they get the full context of what the visitor wanted, making their follow-up 10x more effective.

**For our clients (the businesses using our platform):**

- They can finally connect chatbot conversations to real revenue
- Their sales teams get warm leads with full context instead of cold emails
- They can measure ROI on the chatbot — "this chatbot generated 200 leads this month"

**For us (as a platform):**

- This is a premium feature that justifies higher pricing tiers
- It increases stickiness — once a business is capturing leads through us, they won't leave
- It differentiates us from basic chatbot builders that only answer questions

---

## How It Works — The Full Flow

### Step 1: Business Configures Lead Capture on the Dashboard

When a business creates or edits a chatbot on our dashboard, they get a new **Lead Capture** settings section. Here they decide:

**When should the chatbot ask for contact info?**

- **After a set number of messages** — For example, after the visitor has exchanged 3 messages, the chatbot naturally asks for their email. This ensures the visitor is engaged before we ask.
- **When the visitor asks about pricing or availability** — The chatbot detects high-intent questions and offers to send details via email. Example: "I can send you a detailed quote — what's your email?"
- **When the chatbot can't answer a question** — Instead of a dead end, the chatbot says: "I don't have that info right now, but I can connect you with our team. What's the best email to reach you?"
- **Before starting the conversation (Gated)** — The chatbot asks for name and email before the conversation begins. This captures every visitor but may reduce engagement.
- **On exit intent** — When the visitor is about to close the chat, a quick prompt appears: "Before you go, want us to send you a summary? Drop your email."

The business can enable one or more of these triggers depending on their strategy.

**What information should be collected?**

The business chooses which fields to collect:

- Email (required by default)
- Name
- Phone number
- Company name
- Custom fields (the business can define their own, like "Budget range" or "Project timeline")

**How should the form appear?**

- **Inline in chat** — The chatbot asks conversationally within the chat flow, one field at a time. This feels natural and has higher completion rates.
- **Pop-up form** — A small form card appears inside the chat widget. Better for collecting multiple fields at once.

### Step 2: Visitor Interacts with the Chatbot

A visitor lands on the client's website (e.g., a Shopify store) and opens the chatbot. The conversation happens normally — the chatbot answers questions using the business's knowledge base.

When the configured trigger condition is met, the chatbot smoothly transitions into lead capture.

**Example conversation flow:**

> **Visitor:** "Do you ship to Canada?"
>
> **Chatbot:** "Yes, we ship to Canada! Standard shipping takes 7-10 business days. Would you like me to send you a tracking link and a 10% first-order discount? Just share your email."
>
> **Visitor:** enters email
>
> **Chatbot:** "Got it! You'll receive the discount code shortly. Is there anything else I can help with?"

The key principle: **the lead capture feels like a natural part of the conversation, not an interruption.**

### Step 3: Lead is Captured and Stored

Once the visitor submits their info, the lead is saved with the following context:

- **Contact details** — Whatever the visitor provided (email, name, phone, etc.)
- **Conversation link** — The full chat transcript is attached to the lead
- **Intent level** — Automatically classified as Hot, Warm, or Cold based on what the visitor discussed
  - **Hot:** Asked about pricing, availability, or showed clear buying signals
  - **Warm:** Asked product questions, compared options, showed interest
  - **Cold:** General browsing, asked basic questions
- **Topics discussed** — A summary of what the visitor was interested in (e.g., "shipping to Canada, winter jacket collection, discount codes")
- **Source page** — The URL of the page where the chatbot was embedded
- **Timestamp** — When the lead was captured

### Step 4: Business Gets Notified

The moment a lead is captured:

- **Email notification** is sent to the business owner (or their sales team) with the lead's details and conversation summary
- **Dashboard notification** appears in the leads section
- **Webhook fires** (if configured) to push the lead data to external tools like their CRM, Google Sheets, Zapier, or any custom endpoint

### Step 5: Business Manages Leads on the Dashboard

The dashboard gets a new **Leads** page where the business can:

- **View all leads** in a table with filters (date range, intent level, chatbot, status)
- **Click on any lead** to see the full conversation — this is the killer feature. The sales team knows exactly what the visitor wanted before they make a call
- **Update lead status** — Mark as New, Contacted, Converted, or Archived
- **Export leads** — Download as CSV for importing into any CRM or spreadsheet
- **View analytics** — See how many leads each chatbot is generating, which trigger type works best, conversion trends over time

---

## Lead Capture Triggers — Detailed Behavior

| Trigger | When It Fires | Best For |
|---|---|---|
| After X messages | Visitor has sent X messages (configurable, default: 3) | General engagement capture |
| High-intent detection | Visitor asks about pricing, availability, booking, or demos | Sales-driven businesses |
| Chatbot can't answer | No relevant answer found in knowledge base | Capturing leads that need human follow-up |
| Gated (before chat) | Before the first message | Businesses that prioritize lead volume |
| Exit intent | Visitor is about to close the chat widget | Last-chance capture |

The business can combine multiple triggers. For example: gated capture for email + high-intent detection for phone number.

---

## Lead Intent Classification

Every captured lead is automatically tagged with an intent level. This helps sales teams prioritize who to call first.

**Hot Lead Signals:**

- Asked about pricing, cost, or quotes
- Asked about availability or stock
- Requested a demo or meeting
- Asked about purchasing process or checkout
- Mentioned timeline or urgency ("I need this by Friday")

**Warm Lead Signals:**

- Asked detailed product/service questions
- Compared options or features
- Asked about shipping, returns, or warranties
- Spent significant time in conversation (5+ messages)

**Cold Lead Signals:**

- Asked general or broad questions
- Only 1-2 messages before providing contact info
- Questions were informational, not transactional

This classification is done automatically using the conversation context that our AI already understands.

---

## Notification System

When a lead is captured, the business should be notified immediately so they can follow up while the lead is still warm.

**Email Notification:**

- Sent instantly to the business owner's email (configurable — can add multiple recipients)
- Contains: lead name, email, intent level, and a brief summary of what they discussed
- Includes a direct link to view the full conversation on the dashboard

**Webhook (for advanced users):**

- The business can configure a webhook URL on the dashboard
- When a lead is captured, we POST the lead data as JSON to that URL
- This enables integration with any external system: Zapier, Make, HubSpot, Salesforce, Slack, Google Sheets, or custom CRMs
- The webhook payload includes all lead fields plus conversation summary

**Dashboard Notification:**

- New lead count badge on the Leads tab
- Real-time updates if the dashboard is open

---

## Dashboard — Leads Page

The leads page is the central hub for managing all captured leads across all chatbots.

**Main View — Leads Table:**

- Columns: Name, Email, Intent (Hot/Warm/Cold), Chatbot Name, Captured Date, Status, Source Page
- Filters: Date range, intent level, chatbot, status
- Search: By name, email, or conversation content
- Sort: By date, intent level, or status
- Bulk actions: Export selected, change status, delete

**Lead Detail View (click on any lead):**

- Full contact information
- Intent tag with explanation
- Topics discussed (auto-generated summary)
- Complete conversation transcript
- Source page URL
- Status management (New → Contacted → Converted → Archived)
- Notes field for the sales team to add follow-up notes

**Leads Analytics:**

- Total leads captured (by day/week/month)
- Leads by intent level (pie chart)
- Leads by chatbot (if they have multiple)
- Best performing trigger type
- Conversion funnel: Leads → Contacted → Converted

---

## Integration with Existing Features

Lead Capture connects naturally with features we already have:

- **Chatbot Customization** — Lead capture form inherits the chatbot's color scheme and branding
- **Multi-channel deployment** — Leads are captured from wherever the chatbot is deployed (website widget, Slack, Telegram, WhatsApp) with the channel identified
- **Analytics** — Lead metrics are added to existing chatbot analytics
- **Quota/Tier System** — Lead capture limits can be tied to pricing tiers (e.g., Free: 50 leads/month, Pro: Unlimited)
- **Access Control** — Leads are scoped per chatbot, per tenant. Each business only sees their own leads

---

## Competitive Advantage

Most chatbot platforms offer basic lead capture — a static form that collects name and email with zero context.

**What makes ours different:**

1. **Every lead comes with full conversation context.** The sales team doesn't just get an email — they know exactly what the visitor was looking for, what questions they had, and how interested they were.

2. **AI-powered intent classification.** Leads are automatically prioritized so sales teams focus on the hottest prospects first.

3. **Smart, contextual triggers.** Instead of interrupting every visitor with a form, we capture leads at the right moment when it feels natural and the visitor is most engaged.

4. **Multi-channel lead capture.** Whether the visitor is chatting on a website, Slack, Telegram, or WhatsApp — leads are captured consistently and managed in one place.

---

## Implementation Phases

### Phase 1 — MVP (Ship First)

- Lead capture form configuration on dashboard (trigger type + fields)
- Inline lead capture in chat widget (conversational style)
- Leads table on dashboard with basic filters
- Lead detail view with full conversation
- Email notification on new lead
- CSV export

### Phase 2 — Intelligence

- Auto intent classification (Hot/Warm/Cold)
- Topics discussed auto-summary
- Webhook integration for external tools
- Lead analytics dashboard

### Phase 3 — Scale

- Native CRM integrations (HubSpot, Salesforce, Mailchimp)
- A/B testing on trigger types (which trigger captures more leads)
- Lead scoring customization (business defines their own hot/warm/cold criteria)
- Slack/Teams notification channel for new leads

---

## Summary

Lead Capture turns our chatbot from a support tool into a revenue-generating asset for our clients. Every conversation becomes an opportunity. Every visitor becomes a potential customer. And every lead comes with the full context needed to close the deal.

This is not just a feature — it's the reason businesses will choose our platform over competitors.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { aiActionsApi, builtinIntegrationsApi } from '@/lib/api';
import {
  Zap, Plus, Trash2, MousePointer, FormInput, Puzzle,
  ChevronDown, ChevronUp, ExternalLink, GripVertical,
  AlertTriangle, X, CheckCircle2, ChevronRight, Loader2,
  RefreshCw, Link2Off,
} from 'lucide-react';

// ── Button / Form Action Types (unchanged) ─────────────────────────────────

type Tab = 'buttons' | 'forms' | 'builtin';
type ButtonActionType = 'open_url' | 'send_message' | 'trigger_webhook' | 'copy_clipboard';

interface ButtonAction {
  id: string; label: string; actionType: ButtonActionType;
  actionValue: string; condition: string; enabled: boolean;
}

type FormFieldType = 'text' | 'email' | 'phone' | 'number' | 'select';

interface FormField {
  id: string; name: string; type: FormFieldType; required: boolean;
}

interface FormAction {
  id: string; name: string; triggerPhrase: string;
  fields: FormField[]; webhookUrl: string; enabled: boolean;
}

// ── Builtin Integration Types ──────────────────────────────────────────────

interface CredentialField {
  key: string; label: string; placeholder: string;
  type: 'text' | 'password' | 'email' | 'url';
  hint?: string;
}

interface OperationDef {
  key: string; label: string; description: string;
}

type ConnectType = 'api_key' | 'webhook' | 'oauth';

interface IntegrationDef {
  key: string; name: string; description: string; connectType: ConnectType;
  credentialFields: CredentialField[]; operations: OperationDef[];
  defaultTrigger: string; color: string; initial: string; comingSoon?: boolean;
}

interface IntegrationConfig {
  integrationKey: string; enabled: boolean; connected: boolean;
  operations: string[]; triggerDescription: string; metadata: Record<string, string>;
}

// ── Integration Definitions ────────────────────────────────────────────────

const ALL_INTEGRATIONS: IntegrationDef[] = [
  {
    key: 'zapier', name: 'Zapier',
    description: 'Trigger Zaps when your chatbot takes an action',
    connectType: 'webhook',
    credentialFields: [{ key: 'webhookUrl', label: 'Zapier Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', type: 'url', hint: 'Create a "Catch Hook" trigger in Zapier, then paste the webhook URL here.' }],
    operations: [],
    defaultTrigger: 'Use this action to send data to Zapier whenever a key event occurs in the conversation, such as when a user provides their contact information or requests support.',
    color: 'bg-[#FF4A00]/10 text-[#FF4A00]', initial: 'Z',
  },
  {
    key: 'make', name: 'Make',
    description: 'Trigger Make (Integromat) scenarios from chat',
    connectType: 'webhook',
    credentialFields: [{ key: 'webhookUrl', label: 'Make Webhook URL', placeholder: 'https://hook.eu1.make.com/...', type: 'url', hint: 'Add a "Custom webhook" module as your scenario trigger in Make, then paste the URL here.' }],
    operations: [],
    defaultTrigger: 'Use this action to trigger a Make scenario when the user completes a key interaction, such as submitting a form or requesting a callback.',
    color: 'bg-[#6D00D7]/10 text-[#A855F7]', initial: 'M',
  },
  {
    key: 'slack_alerts', name: 'Slack Alerts',
    description: 'Send real-time alerts to your Slack channels',
    connectType: 'webhook',
    credentialFields: [{ key: 'webhookUrl', label: 'Slack Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'url', hint: 'Create an Incoming Webhook in your Slack app settings and paste the URL here.' }],
    operations: [],
    defaultTrigger: 'Send a Slack alert when a user has a high-intent conversation, reports an urgent issue, or when the chatbot cannot answer their question.',
    color: 'bg-[#E01E5A]/10 text-[#E01E5A]', initial: 'S',
  },
  {
    key: 'stripe', name: 'Stripe',
    description: 'Look up payments, invoices, and subscriptions',
    connectType: 'api_key',
    credentialFields: [{ key: 'secretKey', label: 'Secret Key', placeholder: 'sk_live_... or sk_test_...', type: 'password', hint: 'Find your secret key in the Stripe Dashboard under Developers → API keys.' }],
    operations: [
      { key: 'lookup_customer', label: 'Look up customer subscription', description: 'Bot asks for email, retrieves subscription status and plan details' },
      { key: 'check_payment', label: 'Check payment status', description: 'Bot asks for payment ID and returns current status' },
      { key: 'get_invoice', label: 'Retrieve invoice details', description: 'Bot asks for email or invoice ID, returns invoice info' },
      { key: 'process_refund', label: 'Process a refund', description: 'Bot collects charge ID and reason, then initiates a refund' },
    ],
    defaultTrigger: 'Use this action when a customer asks about their billing, subscription status, invoices, payment failures, or wants to request a refund. Ask for their email address to look up their account.',
    color: 'bg-[#635BFF]/10 text-[#635BFF]', initial: '$',
  },
  {
    key: 'zendesk', name: 'Zendesk',
    description: 'Create and manage support tickets automatically',
    connectType: 'api_key',
    credentialFields: [
      { key: 'subdomain', label: 'Subdomain', placeholder: 'yourcompany', type: 'text', hint: 'The part before .zendesk.com in your Zendesk URL' },
      { key: 'email', label: 'Admin Email', placeholder: 'admin@yourcompany.com', type: 'email' },
      { key: 'apiToken', label: 'API Token', placeholder: 'Your Zendesk API token', type: 'password', hint: 'Found in Zendesk Admin → Apps & Integrations → APIs → Zendesk API' },
    ],
    operations: [
      { key: 'create_ticket', label: 'Create a support ticket', description: 'Bot collects issue details and automatically creates a Zendesk ticket' },
      { key: 'check_ticket', label: 'Check ticket status', description: 'Bot asks for ticket ID and returns the current status' },
      { key: 'escalate', label: 'Escalate to a human agent', description: 'Bot creates a high-priority ticket when it cannot resolve the issue' },
    ],
    defaultTrigger: 'Use this action when a customer has a support issue that needs tracking, wants to escalate a problem, or asks to speak with a human agent. Collect their name, email, and issue description.',
    color: 'bg-[#78A300]/10 text-[#78A300]', initial: 'Z',
  },
  {
    key: 'freshdesk', name: 'Freshdesk',
    description: 'Create and track support tickets in Freshdesk',
    connectType: 'api_key',
    credentialFields: [
      { key: 'domain', label: 'Freshdesk Domain', placeholder: 'yourcompany', type: 'text', hint: 'The part before .freshdesk.com in your Freshdesk URL' },
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Freshdesk API key', type: 'password', hint: 'Found in your Freshdesk profile → API Key' },
    ],
    operations: [
      { key: 'create_ticket', label: 'Create a support ticket', description: 'Bot collects issue details and opens a tracked Freshdesk ticket' },
      { key: 'check_ticket', label: 'Check ticket status', description: 'Bot asks for ticket ID and returns current status and updates' },
    ],
    defaultTrigger: 'Use this action when a customer has a support request that needs to be tracked or escalated beyond what the chatbot can handle on its own.',
    color: 'bg-[#25C16F]/10 text-[#25C16F]', initial: 'F',
  },
  {
    key: 'hubspot', name: 'HubSpot',
    description: 'Capture leads and create deals in your CRM',
    connectType: 'api_key',
    credentialFields: [{ key: 'privateAppToken', label: 'Private App Token', placeholder: 'pat-na1-...', type: 'password', hint: 'Create a Private App in HubSpot Settings → Integrations → Private Apps' }],
    operations: [
      { key: 'create_contact', label: 'Create a contact', description: 'Bot collects name and email, then creates a HubSpot contact' },
      { key: 'update_contact', label: 'Update a contact', description: 'Bot looks up contact by email and updates their information' },
      { key: 'create_deal', label: 'Create a deal', description: 'Bot creates a new deal in your pipeline with collected information' },
    ],
    defaultTrigger: 'Use this action when a user shows buying intent, provides their contact information, or asks about pricing. Automatically capture leads into your HubSpot CRM.',
    color: 'bg-[#FF7A59]/10 text-[#FF7A59]', initial: 'H',
  },
  {
    key: 'calendly', name: 'Calendly',
    description: 'Let users book meetings directly from chat',
    connectType: 'api_key',
    credentialFields: [{ key: 'apiKey', label: 'Personal Access Token', placeholder: 'eyJ...', type: 'password', hint: 'Found in Calendly → Integrations → API & Webhooks → Personal Access Tokens' }],
    operations: [
      { key: 'get_available_slots', label: 'Show available time slots', description: 'Bot fetches and displays your open meeting availability' },
      { key: 'book_meeting', label: 'Book a meeting', description: 'Bot collects name and email, then creates a confirmed booking' },
      { key: 'cancel_meeting', label: 'Cancel a meeting', description: 'Bot asks for the booking link or UUID and cancels the event' },
    ],
    defaultTrigger: 'Use this action when a customer asks to book a demo, schedule a call, or set up a meeting. Show available time slots and confirm the booking without leaving the chat.',
    color: 'bg-[#006BFF]/10 text-[#006BFF]', initial: 'C',
  },
  {
    key: 'cal_com', name: 'Cal.com',
    description: 'Open-source scheduling — book meetings from chat',
    connectType: 'api_key',
    credentialFields: [{ key: 'apiKey', label: 'Cal.com API Key', placeholder: 'cal_live_...', type: 'password', hint: 'Found in Cal.com Settings → Developer → API Keys' }],
    operations: [
      { key: 'get_available_slots', label: 'Show available time slots', description: 'Bot fetches open slots from your Cal.com calendar' },
      { key: 'book_meeting', label: 'Book a meeting', description: 'Bot collects attendee info and creates a confirmed booking' },
      { key: 'cancel_meeting', label: 'Cancel a meeting', description: 'Bot cancels a booking by reference ID or link' },
    ],
    defaultTrigger: 'Use this action when a customer wants to book a meeting, demo, or consultation. Show available time slots and handle the booking seamlessly within the conversation.',
    color: 'bg-white/[0.06] text-[#A1A1AA]', initial: 'C',
  },
  {
    key: 'shopify', name: 'Shopify',
    description: 'Order status, returns, and shipment tracking',
    connectType: 'api_key',
    credentialFields: [
      { key: 'storeDomain', label: 'Store Domain', placeholder: 'yourstore.myshopify.com', type: 'text', hint: 'Your full myshopify.com domain' },
      { key: 'accessToken', label: 'Admin Access Token', placeholder: 'shpat_...', type: 'password', hint: 'Create a custom app in Shopify Admin → Apps → Develop apps' },
    ],
    operations: [
      { key: 'order_status', label: 'Look up order status', description: 'Bot asks for order number or email, returns full order details' },
      { key: 'track_shipment', label: 'Track shipment', description: 'Bot returns tracking info and carrier details for an order' },
      { key: 'initiate_return', label: 'Initiate a return', description: 'Bot creates a return request for a delivered order' },
      { key: 'cancel_order', label: 'Cancel an order', description: 'Bot cancels an order if it has not yet shipped' },
    ],
    defaultTrigger: 'Use this action when a customer asks about their order, shipping status, wants to return a product, or needs to cancel. Ask for their order number or the email used at checkout.',
    color: 'bg-[#96BF48]/10 text-[#96BF48]', initial: 'S',
  },
  {
    key: 'jira', name: 'Jira',
    description: 'Create bug reports and feature requests from chat',
    connectType: 'api_key',
    credentialFields: [
      { key: 'domain', label: 'Atlassian Domain', placeholder: 'yourcompany.atlassian.net', type: 'text' },
      { key: 'email', label: 'Account Email', placeholder: 'you@yourcompany.com', type: 'email' },
      { key: 'apiToken', label: 'API Token', placeholder: 'Your Atlassian API token', type: 'password', hint: 'Create one at id.atlassian.com → Security → API tokens' },
      { key: 'projectKey', label: 'Project Key', placeholder: 'e.g. BUG or DEV', type: 'text', hint: 'The short identifier for your Jira project' },
    ],
    operations: [
      { key: 'create_bug', label: 'Create a bug report', description: 'Bot collects bug details and creates a Jira issue with Bug type' },
      { key: 'create_feature', label: 'Create a feature request', description: 'Bot collects feature idea and creates a Story in Jira' },
      { key: 'check_issue', label: 'Check issue status', description: 'Bot looks up a Jira issue by ID and returns its current status' },
    ],
    defaultTrigger: 'Use this action when a customer reports a bug, requests a new feature, or asks about the status of a previously reported issue.',
    color: 'bg-[#0052CC]/10 text-[#0052CC]', initial: 'J',
  },
  {
    key: 'google_calendar', name: 'Google Calendar',
    description: 'Book and manage meetings in Google Calendar',
    connectType: 'oauth', credentialFields: [], operations: [],
    defaultTrigger: '', color: 'bg-[#4285F4]/10 text-[#4285F4]', initial: 'G', comingSoon: true,
  },
  {
    key: 'salesforce', name: 'Salesforce',
    description: 'Create leads and update CRM records from chat',
    connectType: 'oauth', credentialFields: [], operations: [],
    defaultTrigger: '', color: 'bg-[#00A1E0]/10 text-[#00A1E0]', initial: 'SF', comingSoon: true,
  },
];

// ── Button/Form helpers (unchanged) ───────────────────────────────────────

const ACTION_TYPE_OPTIONS: { value: ButtonActionType; label: string }[] = [
  { value: 'open_url', label: 'Open URL' },
  { value: 'send_message', label: 'Send Message' },
  { value: 'trigger_webhook', label: 'Trigger Webhook' },
  { value: 'copy_clipboard', label: 'Copy to Clipboard' },
];

const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Text' }, { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' }, { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
];

function actionValuePlaceholder(type: ButtonActionType): string {
  switch (type) {
    case 'open_url': return 'https://example.com/pricing';
    case 'send_message': return 'Message to send...';
    case 'trigger_webhook': return 'https://hooks.example.com/trigger';
    case 'copy_clipboard': return 'Text to copy to clipboard';
  }
}

function actionValueLabel(type: ButtonActionType): string {
  switch (type) {
    case 'open_url': return 'URL';
    case 'send_message': return 'Message';
    case 'trigger_webhook': return 'Webhook URL';
    case 'copy_clipboard': return 'Clipboard Text';
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ── Shared primitives (unchanged) ─────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${checked ? 'bg-ink' : 'bg-line-strong'}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function FieldInput({ id, value, onChange, placeholder, className = '', type = 'text' }: { id?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string }) {
  return (
    <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted-soft focus:border-ink focus:outline-none transition-colors ${className}`} />
  );
}

// ── Brand Logos ────────────────────────────────────────────────────────────

function BrandLogo({ integrationKey, size = 22 }: { integrationKey: string; size?: number }) {
  const props = { width: size, height: size, fill: 'currentColor', viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' };
  switch (integrationKey) {
    case 'zapier':
      return (
        <svg {...props}>
          <path d="M11.988 0C5.364 0 0 5.364 0 11.988s5.364 11.988 11.988 11.988 11.988-5.364 11.988-11.988S18.612 0 11.988 0zm-.05 5.498l3.737 5.132H7.2l4.738-5.132zm-6.79 2.394l5.131 3.738-5.131 3.738V7.892zm13.58 0v7.476l-5.131-3.738 5.131-3.738zm-6.79 3.738l4.738 5.132H7.2l4.738-5.132zm-6.79 4.494l5.131-3.738v7.476l-5.131-3.738zm13.58 0l-5.131 3.738V12.38l5.131 3.738zm-6.79 2.394l3.737 5.132H7.2l4.738-5.132z" />
        </svg>
      );
    case 'make':
      return (
        <svg {...props}>
          <path d="M14.984 0H9.016C4.032 0 0 4.032 0 9.016v5.968C0 19.968 4.032 24 9.016 24h5.968C19.968 24 24 19.968 24 14.984V9.016C24 4.032 19.968 0 14.984 0zM12 17.953c-3.288 0-5.953-2.665-5.953-5.953S8.712 6.047 12 6.047s5.953 2.665 5.953 5.953-2.665 5.953-5.953 5.953z" />
        </svg>
      );
    case 'slack_alerts':
      return (
        <svg {...props}>
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
      );
    case 'stripe':
      return (
        <svg {...props}>
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
        </svg>
      );
    case 'zendesk':
      return (
        <svg {...props}>
          <path d="M11.085 6.682V24H0zM11.085 0c0 3.065-2.479 5.55-5.543 5.55C2.479 5.55 0 3.065 0 0h11.085zm1.83 18.45c0-3.065 2.48-5.55 5.543-5.55C21.521 12.9 24 15.385 24 18.45H12.915zM12.915 24V6.682L24 24z" />
        </svg>
      );
    case 'freshdesk':
      return (
        <svg {...props}>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8c3.976 0 7.2 3.224 7.2 7.2s-3.224 7.2-7.2 7.2S4.8 15.976 4.8 12 8.024 4.8 12 4.8z" />
        </svg>
      );
    case 'hubspot':
      return (
        <svg {...props}>
          <path d="M22.086 9.876a4.137 4.137 0 0 0-1.742-1.04V6.52a1.843 1.843 0 0 0 1.062-1.66 1.85 1.85 0 0 0-1.848-1.848 1.85 1.85 0 0 0-1.847 1.847c0 .735.43 1.368 1.056 1.666v2.314a4.17 4.17 0 0 0-1.783 1.085L9.73 5.747a2.894 2.894 0 0 0 .097-.715 2.914 2.914 0 0 0-2.91-2.909 2.914 2.914 0 0 0-2.909 2.91 2.914 2.914 0 0 0 2.91 2.908c.57 0 1.1-.165 1.547-.45l7.175 4.192a4.188 4.188 0 0 0-.217 1.317c0 .498.088.975.247 1.418L10.88 16.4a3.28 3.28 0 0 0-2.116-.778 3.295 3.295 0 0 0-3.29 3.292 3.295 3.295 0 0 0 3.29 3.291 3.295 3.295 0 0 0 3.29-3.291c0-.33-.048-.649-.135-.951l4.75-2.963a4.17 4.17 0 0 0 2.894 1.162 4.192 4.192 0 0 0 4.186-4.187 4.19 4.19 0 0 0-1.663-3.3z" />
        </svg>
      );
    case 'calendly':
      return (
        <svg {...props}>
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.016 17.528a7.148 7.148 0 0 1-5.016 2.068A7.12 7.12 0 0 1 4.884 12 7.12 7.12 0 0 1 12 4.884a7.12 7.12 0 0 1 5.016 2.068l-1.352 1.352A5.2 5.2 0 0 0 12 6.792 5.215 5.215 0 0 0 6.792 12 5.215 5.215 0 0 0 12 17.208a5.2 5.2 0 0 0 3.664-1.512l1.352 1.352v-.52z" />
        </svg>
      );
    case 'cal_com':
      return (
        <svg {...props}>
          <path d="M5.25 0A5.25 5.25 0 0 0 0 5.25v13.5A5.25 5.25 0 0 0 5.25 24h13.5A5.25 5.25 0 0 0 24 18.75V5.25A5.25 5.25 0 0 0 18.75 0H5.25zm2.25 5.25h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5zm-1.5 3.75h12a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5zm0 3.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5z" />
        </svg>
      );
    case 'shopify':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M15.337 4.5s-.204.059-.542.178c-.116-.338-.291-.718-.524-1.095C13.6 2.48 12.72 2 11.664 2c-.07 0-.14.005-.21.013-.042-.055-.09-.105-.14-.153C10.716 1.302 10.03 1 9.392 1 7.532 1 5.68 3.786 4.724 8.1L2.1 8.923C1.35 9.154 1.326 9.18 1.236 9.89L0 19.5l13.764 2.5L19 19.5l.954-15.625-4.617.625zm-2.048 1.219c-.537.163-.99.32-1.366.45-.204-.838-.615-2.05-1.084-2.858.647.12 1.084.766 1.45 2.408zM11.664 3.08c.099 1.092.536 2.326 1.17 3.496-.773.282-1.618.549-2.503.791.607-1.887 1.622-3.438 1.333-4.287zm-3.088.985c-.045.18-.088.368-.128.565.99-.296 2.04-.62 3.124-.986a7.19 7.19 0 0 1-.073.234C10.684 4.61 9.65 6.46 9.112 8.583a68.63 68.63 0 0 1-3.15.755C6.573 7.01 7.718 5.224 8.576 4.065zM7.75 17L2.5 16l.73-6.417c1.043-.316 2.123-.647 3.228-.977C6.19 9.831 6.027 11.051 6.027 12.22c0 .154.007.302.02.443.162.458.465.798.79 1.077.324.281.664.514.956.725.454.324.803.65.927 1.091L7.75 17z" />
        </svg>
      );
    case 'jira':
      return (
        <svg {...props}>
          <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005zm5.723-5.756H5.757a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.762a1.005 1.005 0 0 0-1.022-1.005zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z" />
        </svg>
      );
    case 'google_calendar':
      return (
        <svg {...props}>
          <path d="M18.316 5.684H24v12.632h-5.684zm-12.632 0H1v12.632h4.684zM18.316 24l5.684-5.684h-5.684zM0 18.316L5.684 24v-5.684zM5.684 0v5.684h12.632V0zM24 5.684L18.316 0v5.684zm-18.316 18.316H18.316V5.684H5.684z" />
        </svg>
      );
    case 'salesforce':
      return (
        <svg {...props}>
          <path d="M10.005 4.88c.9-.96 2.16-1.56 3.56-1.56 1.8 0 3.36.98 4.22 2.44.73-.32 1.54-.5 2.38-.5 3.22 0 5.83 2.62 5.83 5.85 0 3.23-2.61 5.85-5.83 5.85-.4 0-.79-.04-1.16-.12-.73 1.2-2.06 2-3.57 2-1.16 0-2.21-.45-3-1.18-.73 1.59-2.34 2.69-4.21 2.69-2.05 0-3.8-1.33-4.45-3.17-.32.07-.66.1-1 .1-2.49 0-4.5-2.02-4.5-4.51 0-1.66.89-3.11 2.22-3.9-.28-.6-.44-1.27-.44-1.97 0-2.57 2.08-4.65 4.65-4.65 1.32 0 2.51.55 3.36 1.43z" />
        </svg>
      );
    default:
      return <span className="text-sm font-bold">{integrationKey.charAt(0).toUpperCase()}</span>;
  }
}

// ── Integration Card (NEW) ─────────────────────────────────────────────────

function IntegrationCard({ def, config, onConfigure }: { def: IntegrationDef; config?: IntegrationConfig; onConfigure: () => void }) {
  const isConnected = config?.connected && config?.enabled;

  return (
    <div className="v4-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${def.color}`}>
          <BrandLogo integrationKey={def.key} size={22} />
        </div>
        {def.comingSoon ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            Coming Soon
          </span>
        ) : isConnected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-0.5 text-[11px] font-medium text-[#22C55E]">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            Not Connected
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-900">{def.name}</h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{def.description}</p>
        {isConnected && config?.metadata?.accountName && (
          <p className="mt-1.5 text-xs text-[#10B981] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {config.metadata.accountName}</p>
        )}
      </div>

      <button
        onClick={onConfigure}
        disabled={def.comingSoon}
        className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          isConnected
            ? 'border border-line-strong text-ink hover:bg-surface'
            : def.comingSoon
            ? 'border border-slate-200 text-slate-400'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
        }`}
      >
        {isConnected ? 'Configure' : def.comingSoon ? 'Coming Soon' : 'Connect'}
        {!def.comingSoon && <ChevronRight className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ── Wizard Panel (NEW) ─────────────────────────────────────────────────────

type WizardStep = 'connect' | 'operations' | 'behavior';

function WizardPanel({
  def, savedConfig, chatbotId, onSave, onDisconnect, onClose,
}: {
  def: IntegrationDef;
  savedConfig?: IntegrationConfig;
  chatbotId: string;
  onSave: (config: IntegrationConfig) => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  const steps: WizardStep[] = def.operations.length > 0
    ? ['connect', 'operations', 'behavior']
    : ['connect', 'behavior'];

  const [step, setStep] = useState<WizardStep>(steps[0]);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [operations, setOperations] = useState<string[]>(savedConfig?.operations || []);
  const [trigger, setTrigger] = useState(savedConfig?.triggerDescription || def.defaultTrigger);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const isConnected = savedConfig?.connected;
  const stepIndex = steps.indexOf(step);
  const isLastStep = stepIndex === steps.length - 1;

  const handleTestConnection = async () => {
    if (def.connectType === 'webhook' || def.connectType === 'oauth') return;
    const hasCredentials = def.credentialFields.every((f) => credentials[f.key]?.trim());
    if (!hasCredentials) {
      setTestResult({ ok: false, message: 'Please fill in all credential fields before testing.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await builtinIntegrationsApi.test(chatbotId, def.key, credentials);
      setTestResult({
        ok: result.ok,
        message: result.ok
          ? `Connected successfully${result.accountName ? ` as ${result.accountName}` : ''}`
          : result.error || 'Connection failed. Check your credentials and try again.',
      });
    } catch {
      setTestResult({ ok: false, message: 'Connection test failed. Please try again.' });
    } finally {
      setTesting(false);
    }
  };

  const canProceed = (): boolean => {
    if (step === 'connect') {
      if (def.connectType === 'webhook') {
        const url = credentials.webhookUrl || '';
        return url.startsWith('https://');
      }
      if (def.connectType === 'oauth') return false;
      // For api_key: either test passed, or they're re-configuring an already connected integration
      return testResult?.ok === true || (!!isConnected && def.credentialFields.every((f) => !credentials[f.key]?.trim()));
    }
    if (step === 'operations') {
      return operations.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex]);
  };

  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  };

  const handleSaveAndActivate = async () => {
    setSaving(true);
    try {
      const credentialsToSave: Record<string, string> = {};
      // Only send credentials if user entered new ones
      def.credentialFields.forEach((f) => {
        if (credentials[f.key]?.trim()) credentialsToSave[f.key] = credentials[f.key].trim();
      });
      if (def.connectType === 'webhook' && credentials.webhookUrl?.trim()) {
        credentialsToSave.webhookUrl = credentials.webhookUrl.trim();
      }

      const metadata: Record<string, string> = {};
      if (testResult?.ok) {
        const match = testResult.message.match(/as (.+)$/);
        if (match) metadata.accountName = match[1];
      } else if (savedConfig?.metadata?.accountName) {
        metadata.accountName = savedConfig.metadata.accountName;
      }

      await builtinIntegrationsApi.save(chatbotId, def.key, {
        credentials: credentialsToSave,
        operations,
        triggerDescription: trigger,
        enabled: true,
        metadata,
      });

      onSave({
        integrationKey: def.key,
        enabled: true,
        connected: true,
        operations,
        triggerDescription: trigger,
        metadata,
      });
    } catch {
      // silently fail — parent handles toast
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await builtinIntegrationsApi.disconnect(chatbotId, def.key);
      onDisconnect();
    } catch {
      setDisconnecting(false);
      setShowDisconnectConfirm(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold shrink-0 ${def.color}`}>
            {def.initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">{def.name}</h2>
            <p className="text-xs text-slate-500 truncate">{def.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                s === step ? 'bg-ink text-white' : i < stepIndex ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {i < stepIndex ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs font-medium capitalize ${s === step ? 'text-slate-900' : 'text-slate-500'}`}>
                {s === 'connect' ? (def.connectType === 'webhook' ? 'Webhook' : 'Connect') : s === 'operations' ? 'Operations' : 'Behavior'}
              </span>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400 ml-1" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* CONNECT STEP */}
          {step === 'connect' && (
            <div className="space-y-4">
              {isConnected && (
                <div className="flex items-center gap-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#22C55E]">Connected</p>
                    {savedConfig?.metadata?.accountName && (
                      <p className="text-xs text-[#22C55E]/70">{savedConfig.metadata.accountName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDisconnectConfirm(true)}
                    className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#EF4444] transition-colors"
                  >
                    <Link2Off className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
              )}

              {def.connectType === 'webhook' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Paste your webhook URL below. The chatbot will POST conversation data to this URL when the action is triggered.
                  </p>
                  {def.credentialFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">{field.label}</label>
                      <FieldInput
                        value={credentials[field.key] || ''}
                        onChange={(v) => setCredentials((prev) => ({ ...prev, [field.key]: v }))}
                        placeholder={field.placeholder}
                        type={field.type}
                      />
                      {field.hint && <p className="mt-1.5 text-xs text-slate-500">{field.hint}</p>}
                    </div>
                  ))}
                </div>
              )}

              {def.connectType === 'api_key' && (
                <div className="space-y-4">
                  {isConnected && (
                    <p className="text-sm text-slate-500">
                      Your credentials are saved. Enter new values below only if you want to update them.
                    </p>
                  )}
                  {def.credentialFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">{field.label}</label>
                      <FieldInput
                        value={credentials[field.key] || ''}
                        onChange={(v) => {
                          setCredentials((prev) => ({ ...prev, [field.key]: v }));
                          setTestResult(null);
                        }}
                        placeholder={isConnected ? '(unchanged — enter new value to update)' : field.placeholder}
                        type={field.type}
                      />
                      {field.hint && <p className="mt-1.5 text-xs text-slate-500">{field.hint}</p>}
                    </div>
                  ))}

                  {/* Test Connection */}
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-50"
                  >
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {testing ? 'Testing…' : 'Verify Connection'}
                  </button>

                  {testResult && (
                    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
                      testResult.ok
                        ? 'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]'
                        : 'bg-[#FEF2F2] border border-line text-[#EF4444]'
                    }`}>
                      {testResult.ok
                        ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {def.connectType === 'oauth' && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-8 text-center">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold mb-4 ${def.color}`}>
                    {def.initial}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">OAuth Coming Soon</h3>
                  <p className="text-sm text-slate-500">
                    {def.name} integration via OAuth is coming in the next release. We&apos;ll notify you when it&apos;s ready.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* OPERATIONS STEP */}
          {step === 'operations' && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Choose what your chatbot can do</p>
                <p className="text-xs text-slate-500">Select the operations you want to enable. The chatbot will only perform the actions you check.</p>
              </div>
              {def.operations.map((op) => (
                <label key={op.key} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 cursor-pointer hover:border-line-strong transition-colors group">
                  <input
                    type="checkbox"
                    checked={operations.includes(op.key)}
                    onChange={(e) => {
                      setOperations(e.target.checked
                        ? [...operations, op.key]
                        : operations.filter((k) => k !== op.key));
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-white/[0.20] accent-[#171717] shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-ink transition-colors">{op.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{op.description}</p>
                  </div>
                </label>
              ))}
              {operations.length === 0 && (
                <p className="text-xs text-[#EF4444]">Select at least one operation to continue.</p>
              )}
            </div>
          )}

          {/* BEHAVIOR STEP */}
          {step === 'behavior' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">When should the chatbot use {def.name}?</p>
                <p className="text-xs text-slate-500">
                  Describe in plain English when this action should be triggered. The AI reads this and decides when to invoke {def.name} during conversations.
                </p>
              </div>
              <textarea
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-ink focus:outline-none focus:ring-2 focus:ring-line transition-colors resize-none"
                placeholder="Describe when the chatbot should trigger this action..."
              />
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Example</p>
                <p className="text-xs text-slate-400 italic leading-relaxed">{def.defaultTrigger}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
          <div>
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            {isLastStep ? (
              <button
                onClick={handleSaveAndActivate}
                disabled={saving || !canProceed()}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save & Activate'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-[#08080A] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDisconnectConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Disconnect {def.name}?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will remove your stored credentials and disable all {def.name} actions. You can reconnect at any time.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDisconnectConfirm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-hover transition-colors disabled:opacity-50"
              >
                {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Button / Form sub-components (unchanged) ──────────────────────────────

function ButtonActionCard({ action, onUpdate, onDelete }: { action: ButtonAction; onUpdate: (patch: Partial<ButtonAction>) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="v4-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
        <GripVertical className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="flex-1 min-w-0 text-sm font-medium text-slate-900 truncate">{action.label || 'Untitled Button'}</span>
        <Toggle checked={action.enabled} onChange={(v) => onUpdate({ enabled: v })} />
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button onClick={onDelete} className="p-1 rounded text-slate-500 hover:text-[#EF4444] transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Button Label</label>
            <FieldInput value={action.label} onChange={(v) => onUpdate({ label: v })} placeholder="e.g. View Pricing" />
          </div>
          <div>
            <label htmlFor={`btn-type-${action.id}`} className="block text-xs font-medium text-slate-500 mb-1.5">Action Type</label>
            <select id={`btn-type-${action.id}`} value={action.actionType} onChange={(e) => onUpdate({ actionType: e.target.value as ButtonActionType, actionValue: '' })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-ink focus:outline-none focus:ring-2 focus:ring-line transition-colors">
              {ACTION_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{actionValueLabel(action.actionType)}</label>
            <FieldInput value={action.actionValue} onChange={(v) => onUpdate({ actionValue: v })} placeholder={actionValuePlaceholder(action.actionType)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Condition</label>
            <FieldInput value={action.condition} onChange={(v) => onUpdate({ condition: v })} placeholder="e.g. When user asks about pricing" />
            <p className="mt-1.5 text-xs text-slate-500">Describe when this button should appear in the conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FormFieldRow({ field, onUpdate, onDelete }: { field: FormField; onUpdate: (patch: Partial<FormField>) => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <FieldInput value={field.name} onChange={(v) => onUpdate({ name: v })} placeholder="Field name" className="flex-1" />
      <select value={field.type} onChange={(e) => onUpdate({ type: e.target.value as FormFieldType })}
        className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:border-ink focus:outline-none focus:ring-2 focus:ring-line transition-colors">
        {FIELD_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>)}
      </select>
      <div className="flex items-center gap-2">
        <Toggle checked={field.required} onChange={(v) => onUpdate({ required: v })} />
        <span className="text-xs text-slate-500 w-14">{field.required ? 'Required' : 'Optional'}</span>
      </div>
      <button onClick={onDelete} className="p-1.5 rounded text-slate-400 hover:text-[#EF4444] transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FormActionCard({ form, onUpdate, onDelete }: { form: FormAction; onUpdate: (patch: Partial<FormAction>) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const addField = () => {
    const newField: FormField = { id: generateId(), name: '', type: 'text', required: false };
    onUpdate({ fields: [...form.fields, newField] });
  };
  const updateField = (fieldId: string, patch: Partial<FormField>) => {
    onUpdate({ fields: form.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) });
  };
  const deleteField = (fieldId: string) => {
    onUpdate({ fields: form.fields.filter((f) => f.id !== fieldId) });
  };
  return (
    <div className="v4-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
        <GripVertical className="h-4 w-4 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-900 truncate block">{form.name || 'Untitled Form'}</span>
          {form.fields.length > 0 && <span className="text-xs text-slate-500">{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>}
        </div>
        <Toggle checked={form.enabled} onChange={(v) => onUpdate({ enabled: v })} />
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button onClick={onDelete} className="p-1 rounded text-slate-500 hover:text-[#EF4444] transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Form Name</label>
            <FieldInput value={form.name} onChange={(v) => onUpdate({ name: v })} placeholder="e.g. Contact Information" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Trigger Phrase</label>
            <FieldInput value={form.triggerPhrase} onChange={(v) => onUpdate({ triggerPhrase: v })} placeholder="e.g. When user wants to get in touch" />
            <p className="mt-1.5 text-xs text-slate-500">Describe when the chatbot should display this form</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">Fields</label>
              <span className="text-xs text-slate-500">{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {form.fields.map((field) => (
                <FormFieldRow key={field.id} field={field} onUpdate={(patch) => updateField(field.id, patch)} onDelete={() => deleteField(field.id)} />
              ))}
            </div>
            <button onClick={addField} className="mt-3 w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-sm text-slate-500 hover:border-ink hover:text-ink transition-colors flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />Add Field
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Webhook URL</label>
            <FieldInput value={form.webhookUrl} onChange={(v) => onUpdate({ webhookUrl: v })} placeholder="https://hooks.example.com/form-submit" />
            <p className="mt-1.5 text-xs text-slate-500">Form submissions will be sent to this URL as a POST request</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AIActionsPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('buttons');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Button / Form state
  const [buttonActions, setButtonActions] = useState<ButtonAction[]>([]);
  const [formActions, setFormActions]     = useState<FormAction[]>([]);

  // Builtin integrations state
  const [savedConfigs, setSavedConfigs]         = useState<Record<string, IntegrationConfig>>({});
  const [activeWizardKey, setActiveWizardKey]   = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean; type: 'button' | 'form'; id: string; name: string;
  }>({ open: false, type: 'button', id: '', name: '' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Load button/form actions
  useEffect(() => {
    if (!chatbotId) return;
    setLoading(true);
    aiActionsApi.get(chatbotId)
      .then((data) => {
        if (data.buttonActions?.length) setButtonActions(data.buttonActions);
        if (data.formActions?.length)   setFormActions(data.formActions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chatbotId]);

  // Load builtin integration configs
  useEffect(() => {
    if (!chatbotId) return;
    builtinIntegrationsApi.getAll(chatbotId)
      .then((data) => {
        const map: Record<string, IntegrationConfig> = {};
        data.integrations.forEach((c) => { map[c.integrationKey] = c; });
        setSavedConfigs(map);
      })
      .catch(() => {});
  }, [chatbotId]);

  // Save button/form actions
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await aiActionsApi.save(chatbotId, { buttonActions, formActions, builtins: [] });
      showToast('Actions saved successfully', 'success');
    } catch {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [chatbotId, buttonActions, formActions, showToast]);

  // Button Actions handlers
  const addButtonAction = () => {
    setButtonActions((prev) => [...prev, { id: generateId(), label: '', actionType: 'open_url', actionValue: '', condition: '', enabled: true }]);
  };
  const updateButtonAction = (id: string, patch: Partial<ButtonAction>) => {
    setButtonActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };
  const confirmDeleteButtonAction = (action: ButtonAction) => {
    setDeleteDialog({ open: true, type: 'button', id: action.id, name: action.label || 'Untitled Button' });
  };
  const deleteButtonAction = (id: string) => {
    setButtonActions((prev) => prev.filter((a) => a.id !== id));
  };

  // Form Actions handlers
  const addFormAction = () => {
    setFormActions((prev) => [...prev, { id: generateId(), name: '', triggerPhrase: '', fields: [], webhookUrl: '', enabled: true }]);
  };
  const updateFormAction = (id: string, patch: Partial<FormAction>) => {
    setFormActions((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };
  const confirmDeleteFormAction = (form: FormAction) => {
    setDeleteDialog({ open: true, type: 'form', id: form.id, name: form.name || 'Untitled Form' });
  };
  const deleteFormAction = (id: string) => {
    setFormActions((prev) => prev.filter((f) => f.id !== id));
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'button') deleteButtonAction(deleteDialog.id);
    else deleteFormAction(deleteDialog.id);
    setDeleteDialog({ open: false, type: 'button', id: '', name: '' });
  };

  // Builtin integration handlers
  const handleIntegrationSave = useCallback((config: IntegrationConfig) => {
    setSavedConfigs((prev) => ({ ...prev, [config.integrationKey]: config }));
    setActiveWizardKey(null);
    showToast(`${ALL_INTEGRATIONS.find((i) => i.key === config.integrationKey)?.name || 'Integration'} connected successfully`, 'success');
  }, [showToast]);

  const handleIntegrationDisconnect = useCallback((integrationKey: string) => {
    setSavedConfigs((prev) => {
      const next = { ...prev };
      delete next[integrationKey];
      return next;
    });
    setActiveWizardKey(null);
    showToast('Integration disconnected', 'success');
  }, [showToast]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'buttons', label: 'Button Actions',   icon: <MousePointer className="h-4 w-4" /> },
    { key: 'forms',   label: 'Form Actions',      icon: <FormInput className="h-4 w-4" />   },
    { key: 'builtin', label: 'Built-in Actions',  icon: <Puzzle className="h-4 w-4" />      },
  ];

  const connectedCount = Object.values(savedConfigs).filter((c) => c.connected && c.enabled).length;

  if (loading) {
    return (
      <div className="space-y-6 v4-animate-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-80 rounded-xl bg-slate-100 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-50 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const activeWizardDef = activeWizardKey ? ALL_INTEGRATIONS.find((i) => i.key === activeWizardKey) : null;

  return (
    <div className="space-y-6 v4-animate-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[70] flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-white border-[#22C55E]/30 text-[#22C55E]'
            : 'bg-white border-line text-[#EF4444]'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FC5990] to-[#AC5DE6]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Actions</h1>
            <p className="text-sm text-slate-500">Configure actions your chatbot can perform during conversations</p>
          </div>
        </div>
        {activeTab !== 'builtin' && (
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-ink text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.icon}{tab.label}
            {tab.key === 'builtin' && connectedCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {connectedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Button Actions Tab ──────────────────────────────────────────────── */}
      {activeTab === 'buttons' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Define clickable buttons that appear in chat responses</p>
          {buttonActions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <MousePointer className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No button actions configured</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Add your first action to enhance chatbot interactions.</p>
              <button onClick={addButtonAction} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover transition-colors">
                <Plus className="h-4 w-4" />Add Button Action
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {buttonActions.map((action) => (
                  <ButtonActionCard key={action.id} action={action} onUpdate={(patch) => updateButtonAction(action.id, patch)} onDelete={() => confirmDeleteButtonAction(action)} />
                ))}
              </div>
              <button onClick={addButtonAction} className="w-full rounded-xl border border-dashed border-slate-200 py-3 text-sm text-slate-500 hover:border-ink hover:text-ink transition-colors flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />Add Button Action
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Form Actions Tab ────────────────────────────────────────────────── */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Create forms that collect structured data from users</p>
          {formActions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <FormInput className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No form actions configured</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Create forms to collect data from your users.</p>
              <button onClick={addFormAction} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover transition-colors">
                <Plus className="h-4 w-4" />Add Form Action
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {formActions.map((form) => (
                  <FormActionCard key={form.id} form={form} onUpdate={(patch) => updateFormAction(form.id, patch)} onDelete={() => confirmDeleteFormAction(form)} />
                ))}
              </div>
              <button onClick={addFormAction} className="w-full rounded-xl border border-dashed border-slate-200 py-3 text-sm text-slate-500 hover:border-ink hover:text-ink transition-colors flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />Add Form Action
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Built-in Actions Tab ─────────────────────────────────────────────── */}
      {activeTab === 'builtin' && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Connect third-party tools your chatbot can use during conversations.{' '}
              {connectedCount > 0 && (
                <span className="text-[#22C55E]">{connectedCount} connected.</span>
              )}
            </p>
          </div>

          {/* Webhook / Automation section */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Automation & Webhooks</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_INTEGRATIONS.filter((i) => i.connectType === 'webhook').map((def) => (
                <IntegrationCard
                  key={def.key} def={def}
                  config={savedConfigs[def.key]}
                  onConfigure={() => setActiveWizardKey(def.key)}
                />
              ))}
            </div>
          </div>

          {/* API-key integrations */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#3F3F46] mb-3">Native Integrations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_INTEGRATIONS.filter((i) => i.connectType === 'api_key').map((def) => (
                <IntegrationCard
                  key={def.key} def={def}
                  config={savedConfigs[def.key]}
                  onConfigure={() => setActiveWizardKey(def.key)}
                />
              ))}
            </div>
          </div>

          {/* OAuth / Coming Soon */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#3F3F46] mb-3">Coming Soon</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_INTEGRATIONS.filter((i) => i.comingSoon).map((def) => (
                <IntegrationCard key={def.key} def={def} config={savedConfigs[def.key]} onConfigure={() => {}} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Setup Wizard Panel ──────────────────────────────────────────────── */}
      {activeWizardDef && (
        <WizardPanel
          def={activeWizardDef}
          savedConfig={savedConfigs[activeWizardDef.key]}
          chatbotId={chatbotId}
          onSave={handleIntegrationSave}
          onDisconnect={() => handleIntegrationDisconnect(activeWizardDef.key)}
          onClose={() => setActiveWizardKey(null)}
        />
      )}

      {/* ── Delete Dialog ───────────────────────────────────────────────────── */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteDialog({ open: false, type: 'button', id: '', name: '' })} />
          <div className="relative w-full max-w-md rounded-2xl bg-slate-50 border border-slate-200 shadow-2xl p-6">
            <button onClick={() => setDeleteDialog({ open: false, type: 'button', id: '', name: '' })} className="absolute right-4 top-4 text-slate-500 hover:text-slate-900 transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2]">
                <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Delete {deleteDialog.type === 'button' ? 'Button Action' : 'Form Action'}</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-900">&quot;{deleteDialog.name}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteDialog({ open: false, type: 'button', id: '', name: '' })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-hover transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';
import { Eyebrow, IconChip, Pill, Status, Button } from '@/components/corpus';

type Category = 'all' | 'website' | 'messaging' | 'ecommerce';

interface IntegrationCard {
  id: string;
  name: string;
  category: 'website' | 'messaging' | 'ecommerce';
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  actionLabel: string;
  comingSoon?: boolean;
}

/* ─── Brand SVG icons (third-party brand marks stay in brand colors) ─ */
function SlackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127 127" className={className} aria-label="Slack">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2H27.2V80z" fill="#E01E5A"/>
      <path d="M33.7 80c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
      <path d="M46.9 27c-7.3 0-13.2-5.9-13.2-13.2C33.7 6.5 39.6.6 46.9.6c7.3 0 13.2 5.9 13.2 13.2V27H46.9z" fill="#36C5F0"/>
      <path d="M46.9 33.5c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 59.9.7 54 .7 46.7c0-7.3 5.9-13.2 13.2-13.2H46.9z" fill="#36C5F0"/>
      <path d="M99.9 46.7c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.7z" fill="#2EB67D"/>
      <path d="M93.4 46.7c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v32.9z" fill="#2EB67D"/>
      <path d="M80.1 99.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.7H80.1z" fill="#ECB22E"/>
      <path d="M80.1 93.2c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h32.9c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E"/>
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Telegram">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.288c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.933z" fill="#229ED9"/>
    </svg>
  );
}

function WordPressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="WordPress">
      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.911 12c0-.518.068-1.02.189-1.501L8.2 21.274C5.656 19.812 3.911 17.105 3.911 12zm8.089 8.085c-.627 0-1.233-.089-1.811-.249L13.25 12.9l2.021 5.539c.013.033.027.064.043.094A8.087 8.087 0 0 1 12 20.085zm1.19-12.024c.517-.027.983-.081.983-.081.463-.054.409-.735-.054-.708 0 0-1.39.108-2.287.108-.843 0-2.26-.108-2.26-.108-.463-.027-.517.681-.054.708 0 0 .437.054.9.081l1.337 3.663-1.878 5.627-3.123-9.29c.518-.027.983-.081.983-.081.463-.054.409-.735-.054-.708 0 0-1.39.108-2.287.108-.161 0-.35-.004-.549-.01A8.086 8.086 0 0 1 12 3.912c2.467 0 4.714.999 6.34 2.621-.04-.003-.08-.007-.12-.007-.843 0-1.44.735-1.44 1.524 0 .708.409 1.306.843 2.014.327.572.707 1.306.707 2.368 0 .735-.282 1.586-.654 2.774l-.858 2.863-3.128-9.008zm3.461 11.327-.066-.127-2.702-7.4.826-2.397c.434-.899.615-1.617.615-2.258 0-.232-.015-.449-.044-.65A8.086 8.086 0 0 1 20.089 12c0 2.803-1.427 5.273-3.596 6.73l.158-.342z" fill="#21759B"/>
    </svg>
  );
}

function ShopifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 109.5 124.5" className={className} aria-label="Shopify">
      <path d="M74.7 14.8s-.3.1-.7.2c-.4-1.2-1-2.7-1.8-4.1C69.8 7 67.4 5.3 64.5 5.3c-.2 0-.4 0-.6.1-.1-.1-.2-.2-.3-.4-1.3-1.4-2.9-2-4.8-2-3.7.1-7.4 2.8-10.4 7.5-2.1 3.3-3.7 7.5-4.2 10.7L34.6 23c-2.8.9-2.9.9-3.3 3.5l-8.5 65.3 64.3 11.1 13.8-3.3L74.7 14.8zm-14 4.4c-2.5.8-5.2 1.6-7.9 2.4.8-2.9 2.2-5.8 4.1-7.7.7-.7 1.6-1.5 2.7-1.9.9 1.9 1.1 4.6 1.1 7.2zm-5.4-9.8c.9 0 1.6.2 2.2.6-1 .5-1.9 1.3-2.8 2.2-2.3 2.5-4 6.3-4.8 9.9l-6.3 1.9c1.7-6.7 6-14.6 11.7-14.6zm7.3 47.8c-.2-3.3-4.5-4.3-4.5-7.4 0-2.1 1.6-3.9 5-3.9.7 0 1.3.1 1.9.2l1.4-8.5s-2.2-.6-4.9-.6c-8.1 0-13.1 4.3-13.1 10.4 0 5.9 5.3 7.9 9.1 10.5 3.6 2.4 4 4.8 4 5.9 0 2.7-2.5 4.5-5.8 4.5-4.8 0-7.3-1.8-7.3-1.8l-1.5 9s3.1 1.8 8.6 1.8c9.5 0 15.3-4.7 15.3-12 .1-5.3-3.7-8-8.2-10.1z" fill="#96BF48"/>
      <path d="M100.3 99.6L86.5 102.7 23.3 91.7l8.5-65.3c.4-2.5.5-2.6 3.3-3.5l10.1-3.1c2.1-.6 2.9 1.1 2.9 1.1s-1 9.4-1.4 10.5c3.3-1.8 7.2-2.9 7.2-2.9l.3-2.9c.5-3.2 2.1-7.4 4.2-10.7 3-4.7 6.7-7.4 10.4-7.5 1.9 0 3.5.6 4.8 2 .1.1.2.2.3.4.2 0 .4-.1.6-.1 2.9 0 5.3 1.7 7.7 5.6.8 1.4 1.4 2.9 1.8 4.1.4-.1.7-.2.7-.2l26.1 85.2-10.5 2.7z" fill="#5E8E3E"/>
    </svg>
  );
}

const FILTERS: { label: string; value: Category }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Website',     value: 'website' },
  { label: 'Messaging',   value: 'messaging' },
  { label: 'E-commerce',  value: 'ecommerce' },
];

const INTEGRATIONS: IntegrationCard[] = [
  { id: 'website-embed', name: 'Website embed', category: 'website',   description: 'Drop a one-line script tag onto any page.',         icon: <Globe className="w-5 h-5 text-ink" />, connected: false, actionLabel: 'Get code'      },
  { id: 'wordpress',     name: 'WordPress',     category: 'website',   description: 'Install the CorpusAI plugin on your WordPress.',    icon: <WordPressIcon className="w-5 h-5" />,  connected: false, actionLabel: 'Install plugin' },
  { id: 'slack',         name: 'Slack',         category: 'messaging', description: 'Connect your chatbot to a Slack workspace.',         icon: <SlackIcon className="w-5 h-5" />,      connected: false, actionLabel: 'Connect'        },
  { id: 'telegram',      name: 'Telegram',      category: 'messaging', description: 'Deploy your chatbot as a Telegram bot.',             icon: <TelegramIcon className="w-5 h-5" />,   connected: false, actionLabel: 'Connect'        },
  { id: 'shopify',       name: 'Shopify',       category: 'ecommerce', description: 'AI-powered customer support on Shopify.',            icon: <ShopifyIcon className="w-5 h-5" />,    connected: false, actionLabel: 'Install app',   comingSoon: true },
];

/* ─── Modal ──────────────────────────────────────────────── */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-canvas border border-line shadow-lg`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-soft hover:text-ink hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function DeployPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [activeFilter, setActiveFilter] = useState<Category>('all');

  const [showEmbedDialog,     setShowEmbedDialog]     = useState(false);
  const [copied,              setCopied]              = useState(false);
  const [showWordPressDialog, setShowWordPressDialog] = useState(false);
  const [showSlackDialog,     setShowSlackDialog]     = useState(false);
  const [showTelegramDialog,  setShowTelegramDialog]  = useState(false);
  const [showShopifyDialog,   setShowShopifyDialog]   = useState(false);

  const filtered = activeFilter === 'all' ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === activeFilter);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const embedSnippet = `<script src="${baseUrl}/api/widget.js" data-chatbot-id="${chatbotId}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = embedSnippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardAction = (id: string) => {
    switch (id) {
      case 'website-embed': setShowEmbedDialog(true); break;
      case 'wordpress':     setShowWordPressDialog(true); break;
      case 'slack':         setShowSlackDialog(true); break;
      case 'telegram':      setShowTelegramDialog(true); break;
      case 'shopify':       setShowShopifyDialog(true); break;
    }
  };

  return (
    <div className="v4-animate-in space-y-8">

      {/* Header */}
      <div>
        <Eyebrow>Deploy</Eyebrow>
        <h1
          className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Ship the bot.</span>{' '}
          <span className="text-muted">Pick a surface.</span>
        </h1>
      </div>

      {/* Layout: sidebar filter + grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-row gap-1 lg:flex-col lg:w-48 lg:shrink-0">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`rounded-lg px-4 py-2 text-[13px] font-medium text-left transition-colors ${
                  isActive ? 'bg-surface text-ink' : 'text-muted hover:bg-surface hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((card, i) => (
            <div key={card.id} className="v4-card v4-animate-in p-5 flex flex-col" style={{ animationDelay: `${60 + i * 60}ms` }}>
              <IconChip>{card.icon}</IconChip>

              <div className="mt-4 flex items-center gap-2">
                <h3
                  className="font-display text-[15px] font-medium text-ink"
                  style={{ letterSpacing: '-0.012em' }}
                >
                  {card.name}
                </h3>
                {card.comingSoon && <Pill variant="mono">Coming soon</Pill>}
              </div>

              <p className="mt-1.5 flex-1 text-[13px] text-muted leading-relaxed">{card.description}</p>

              <div className="mt-4">
                {card.connected
                  ? <Status kind="live" />
                  : <span className="inline-flex items-center gap-2">
                      <span className="w-1 h-3 rounded-sm bg-line-strong" />
                      <span className="font-mono uppercase text-[10px] tracking-[0.14em] text-muted-soft">Not connected</span>
                    </span>
                }
              </div>

              <div className="mt-4">
                <button
                  disabled={card.comingSoon}
                  onClick={() => handleCardAction(card.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {card.actionLabel}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Website embed modal */}
      <Modal open={showEmbedDialog} onClose={() => setShowEmbedDialog(false)}>
        <Eyebrow>Website embed</Eyebrow>
        <h2
          className="font-display text-[20px] font-medium text-ink mt-2"
          style={{ letterSpacing: '-0.012em' }}
        >
          Drop this on your page.
        </h2>
        <p className="text-[13px] text-muted mt-2 mb-5">
          Paste before the closing{' '}
          <code className="font-mono bg-surface border border-line px-1 py-0.5 rounded text-[12px] text-ink">&lt;/body&gt;</code>{' '}
          tag.
        </p>

        <div className="rounded-xl bg-surface border border-line p-4 font-mono text-[12px] text-ink overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all">{embedSnippet}</pre>
        </div>

        <div className="flex items-center justify-end gap-2 pt-5">
          <Button variant="secondary" onClick={() => setShowEmbedDialog(false)}>Close</Button>
          <Button
            variant="secondary"
            icon={ExternalLink}
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/widget/${chatbotId}`, '_blank')}
          >
            Preview
          </Button>
          <Button variant="primary" icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Modal>

      {/* WordPress */}
      <Modal open={showWordPressDialog} onClose={() => setShowWordPressDialog(false)}>
        <div className="flex items-center gap-3 mb-5">
          <IconChip><WordPressIcon className="w-5 h-5" /></IconChip>
          <div>
            <Eyebrow>Integration</Eyebrow>
            <h2
              className="font-display text-[18px] font-medium text-ink mt-1"
              style={{ letterSpacing: '-0.012em' }}
            >
              Install on WordPress
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            'Log in to your WordPress admin dashboard.',
            <>Navigate to <span className="text-ink font-medium">Plugins → Add New</span> and search for <span className="text-ink font-medium">CorpusAI</span>.</>,
            <>Click <span className="text-ink font-medium">Install Now</span>, then <span className="text-ink font-medium">Activate</span>.</>,
            <>Go to <span className="text-ink font-medium">Settings → CorpusAI</span> and enter your chatbot ID below.</>,
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink"
              >
                {i + 1}
              </span>
              <p className="text-[13px] text-muted pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-surface border border-line p-4 mt-5">
          <Eyebrow>Chatbot ID</Eyebrow>
          <p className="mt-1.5 font-mono text-[14px] text-ink break-all">{chatbotId}</p>
        </div>

        <div className="flex items-center justify-end pt-5">
          <Button variant="secondary" onClick={() => setShowWordPressDialog(false)}>Close</Button>
        </div>
      </Modal>

      {/* Slack */}
      <Modal open={showSlackDialog} onClose={() => setShowSlackDialog(false)}>
        <div className="flex items-center gap-3 mb-5">
          <IconChip><SlackIcon className="w-5 h-5" /></IconChip>
          <div>
            <Eyebrow>Integration</Eyebrow>
            <h2
              className="font-display text-[18px] font-medium text-ink mt-1"
              style={{ letterSpacing: '-0.012em' }}
            >
              Connect to Slack
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            <>Click <span className="text-ink font-medium">Connect with Slack</span> below to authorize CorpusAI in your workspace.</>,
            'Choose the workspace and channel where the bot should respond.',
            'Once authorized, the chatbot begins responding to messages automatically.',
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink"
              >
                {i + 1}
              </span>
              <p className="text-[13px] text-muted pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-5">
          <Button variant="secondary" onClick={() => setShowSlackDialog(false)}>Cancel</Button>
          <Button variant="primary">Connect with Slack</Button>
        </div>
      </Modal>

      {/* Telegram */}
      <Modal open={showTelegramDialog} onClose={() => setShowTelegramDialog(false)}>
        <div className="flex items-center gap-3 mb-5">
          <IconChip><TelegramIcon className="w-5 h-5" /></IconChip>
          <div>
            <Eyebrow>Integration</Eyebrow>
            <h2
              className="font-display text-[18px] font-medium text-ink mt-1"
              style={{ letterSpacing: '-0.012em' }}
            >
              Connect to Telegram
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            <>Open <span className="text-ink font-medium">@BotFather</span> in Telegram and send{' '}
              <code className="font-mono bg-surface border border-line px-1.5 py-0.5 rounded text-[11px] text-ink">/newbot</code>.
            </>,
            'Follow the prompts to name your bot and grab a bot token.',
            'Paste the token into the Integrations settings page to finish.',
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink"
              >
                {i + 1}
              </span>
              <p className="text-[13px] text-muted pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-5">
          <Button variant="secondary" onClick={() => setShowTelegramDialog(false)}>Cancel</Button>
          <Button variant="primary">Open integrations</Button>
        </div>
      </Modal>

      {/* Shopify */}
      <Modal open={showShopifyDialog} onClose={() => setShowShopifyDialog(false)} maxWidth="max-w-md">
        <div className="flex items-center gap-3 mb-5">
          <IconChip><ShopifyIcon className="w-5 h-5" /></IconChip>
          <div>
            <Eyebrow>Integration</Eyebrow>
            <h2
              className="font-display text-[18px] font-medium text-ink mt-1"
              style={{ letterSpacing: '-0.012em' }}
            >
              Shopify integration
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl border border-dashed border-line bg-surface/50 py-10">
          <div className="text-center">
            <ShopifyIcon className="mx-auto w-10 h-10 opacity-30" />
            <p className="mt-3 text-[13px] font-medium text-muted">Coming soon</p>
            <p className="mt-1 text-[12px] text-muted-soft">We&apos;ll notify you when this lands.</p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-5">
          <Button variant="secondary" onClick={() => setShowShopifyDialog(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

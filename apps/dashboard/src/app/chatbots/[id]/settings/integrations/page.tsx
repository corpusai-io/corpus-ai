'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { integrationsApi } from '@/lib/api';
import {
  Hash,
  Phone,
  Zap,
  Send as SendIcon,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Eyebrow, IconChip, Status, Button, Divider } from '@/components/corpus';

interface IntegrationDef {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const INTEGRATIONS: IntegrationDef[] = [
  { key: 'slack',    name: 'Slack',    description: 'Connect to a Slack workspace.',          icon: <Hash     className="w-5 h-5 text-ink" /> },
  { key: 'telegram', name: 'Telegram', description: 'Deploy as a Telegram bot.',              icon: <SendIcon className="w-5 h-5 text-ink" /> },
  { key: 'whatsapp', name: 'WhatsApp', description: 'Connect via WhatsApp Business API.',     icon: <Phone    className="w-5 h-5 text-ink" /> },
  { key: 'zapier',   name: 'Zapier',   description: 'Trigger workflows via Zapier webhooks.', icon: <Zap      className="w-5 h-5 text-ink" /> },
];

export default function IntegrationsPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [setupKey,             setSetupKey]             = useState<string | null>(null);
  const [setupLoading,         setSetupLoading]         = useState(false);
  const [telegramToken,        setTelegramToken]        = useState('');
  const [whatsappPhoneId,      setWhatsappPhoneId]      = useState('');
  const [whatsappAccessToken,  setWhatsappAccessToken]  = useState('');
  const [whatsappVerifyToken,  setWhatsappVerifyToken]  = useState('');
  const [zapierWebhook,        setZapierWebhook]        = useState('');

  const [disconnectKey,     setDisconnectKey]     = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  useEffect(() => { loadIntegrations(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const result: any = await integrationsApi.list(chatbotId);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (key: string): boolean => {
    if (!data) return false;
    const integrations = data.integrations || data;
    switch (key) {
      case 'slack':    return !!integrations.slack;
      case 'telegram': return !!integrations.telegram;
      case 'whatsapp': return !!integrations.whatsApp;
      case 'zapier':   return !!integrations.zapier;
      default:         return false;
    }
  };

  const getConnectionInfo = (key: string): string | null => {
    if (!data) return null;
    const integrations = data.integrations || data;
    switch (key) {
      case 'slack':
        return integrations.slack?.workspaceName || integrations.slack?.teamId
          ? `Workspace: ${integrations.slack.workspaceName || integrations.slack.teamId}`
          : null;
      case 'telegram':
        return integrations.telegram?.botId
          ? `Bot: ${integrations.telegram.botId}`
          : integrations.telegram
            ? 'Bot configured'
            : null;
      case 'whatsapp':
        return integrations.whatsApp?.phoneNumberId
          ? `Phone: ${integrations.whatsApp.phoneNumberId}`
          : null;
      case 'zapier':
        return integrations.zapier?.hookUrl
          ? 'Webhook active'
          : Array.isArray(integrations.zapier)
            ? `${integrations.zapier.length} webhook(s)`
            : null;
      default: return null;
    }
  };

  const handleConnect = (key: string) => {
    if (key === 'slack') {
      integrationsApi
        .getSlackOAuthUrl(chatbotId)
        .then((url) => { window.location.href = url; })
        .catch((err) => alert('Failed to start Slack OAuth: ' + err.message));
      return;
    }
    setSetupKey(key);
  };

  const handleSetupSubmit = async () => {
    if (!setupKey) return;
    setSetupLoading(true);

    try {
      if (setupKey === 'telegram') {
        await integrationsApi.connectTelegram(chatbotId, {
          httpToken: telegramToken,
          botId: telegramToken.split(':')[0] || '',
        });
      } else if (setupKey === 'whatsapp') {
        await integrationsApi.connectWhatsApp(chatbotId, {
          phoneNumberId: whatsappPhoneId,
          accessToken: whatsappAccessToken,
          verificationToken: whatsappVerifyToken || undefined,
        });
      } else if (setupKey === 'zapier') {
        await integrationsApi.connectZapier(chatbotId, {
          hookUrl: zapierWebhook,
          hookType: 'new_lead',
        });
      }

      setSetupKey(null);
      resetSetupForm();
      await loadIntegrations();
    } catch (err: any) {
      alert('Failed to connect: ' + err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  const resetSetupForm = () => {
    setTelegramToken('');
    setWhatsappPhoneId('');
    setWhatsappAccessToken('');
    setWhatsappVerifyToken('');
    setZapierWebhook('');
  };

  const handleDisconnect = async () => {
    if (!disconnectKey) return;
    setDisconnectLoading(true);

    try {
      switch (disconnectKey) {
        case 'slack':       await integrationsApi.disconnectSlack(chatbotId); break;
        case 'telegram':    await integrationsApi.disconnectTelegram(chatbotId); break;
        case 'whatsapp':    await integrationsApi.disconnectWhatsApp(chatbotId); break;
        case 'zapier':      await integrationsApi.disconnectZapier(chatbotId, 'new_lead'); break;
        case 'googleDrive': await integrationsApi.disconnectGoogleDrive(chatbotId); break;
      }
      setDisconnectKey(null);
      await loadIntegrations();
    } catch (err: any) {
      alert('Failed to disconnect: ' + err.message);
    } finally {
      setDisconnectLoading(false);
    }
  };

  const isSetupValid = (): boolean => {
    switch (setupKey) {
      case 'telegram': return telegramToken.trim().length > 0;
      case 'whatsapp': return whatsappPhoneId.trim().length > 0 && whatsappAccessToken.trim().length > 0 && whatsappVerifyToken.trim().length > 0;
      case 'zapier':   return zapierWebhook.trim().length > 0;
      default:         return false;
    }
  };

  if (loading) {
    return (
      <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="v4-shimmer rounded h-2.5 w-32" />
          <div className="v4-shimmer rounded h-7 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="v4-card h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-8">

      {/* Header */}
      <div>
        <Eyebrow>Settings · integrations</Eyebrow>
        <h1
          className="font-display text-3xl md:text-[34px] font-medium leading-tight mt-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Wire your bot up.</span>{' '}
          <span className="text-muted">Wherever your users are.</span>
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INTEGRATIONS.map((integ, i) => {
          const connected = isConnected(integ.key);
          const info = getConnectionInfo(integ.key);

          return (
            <div key={integ.key} className="v4-card v4-animate-in p-5" style={{ animationDelay: `${60 + i * 60}ms` }}>
              <div className="flex items-start gap-4">
                <IconChip>{integ.icon}</IconChip>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3
                      className="font-display text-[15px] font-medium text-ink"
                      style={{ letterSpacing: '-0.012em' }}
                    >
                      {integ.name}
                    </h3>
                    {connected
                      ? <Status kind="live" />
                      : <span className="inline-flex items-center gap-2">
                          <span className="w-1 h-3 rounded-sm bg-line-strong" />
                          <span className="font-mono uppercase text-[10px] tracking-[0.14em] text-muted-soft">Not connected</span>
                        </span>
                    }
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{integ.description}</p>
                  {connected && info && <p className="mt-1 text-[11px] text-muted-soft font-mono">{info}</p>}
                </div>
              </div>

              <div className="mt-4">
                {connected
                  ? (
                    <button
                      onClick={() => setDisconnectKey(integ.key)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-line text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    >
                      Disconnect
                    </button>
                  )
                  : <Button variant="primary" size="sm" onClick={() => handleConnect(integ.key)}>Connect</Button>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Help */}
      <div className="rounded-2xl border border-line bg-surface/50 p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="font-display text-[14px] font-medium text-ink" style={{ letterSpacing: '-0.012em' }}>Need help?</p>
            <p className="mt-1 text-[13px] text-muted">Check our integration guides for step-by-step setup.</p>
          </div>
        </div>
      </div>

      {/* Setup dialog */}
      {setupKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setSetupKey(null); resetSetupForm(); }}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-canvas border border-line shadow-lg p-6">
            <Eyebrow>Connect</Eyebrow>
            <h2
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              {INTEGRATIONS.find((i) => i.key === setupKey)?.name}
            </h2>
            <p className="mt-2 text-[13px] text-muted">Enter the credentials to wire it up.</p>

            <div className="space-y-4 mt-5">
              {setupKey === 'telegram' && (
                <>
                  <div>
                    <label htmlFor="tg-token" className="block text-[13px] font-medium text-muted mb-1.5">
                      Bot token <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="tg-token"
                      type="text"
                      placeholder="123456789:ABCdef…"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-surface border border-line p-3">
                    <Eyebrow className="mb-1.5">How to get a bot token</Eyebrow>
                    <ol className="list-inside list-decimal space-y-0.5 text-[12px] text-muted">
                      <li>Open @BotFather in Telegram</li>
                      <li>Send /newbot and follow the prompts</li>
                      <li>Copy the bot token provided</li>
                    </ol>
                  </div>
                </>
              )}

              {setupKey === 'whatsapp' && (
                <>
                  <div>
                    <label htmlFor="wa-phone" className="block text-[13px] font-medium text-muted mb-1.5">
                      Phone number ID <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="wa-phone"
                      type="text"
                      placeholder="e.g. 101234567890"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="wa-token" className="block text-[13px] font-medium text-muted mb-1.5">
                      Access token <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="wa-token"
                      type="text"
                      placeholder="Your WhatsApp access token"
                      value={whatsappAccessToken}
                      onChange={(e) => setWhatsappAccessToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="wa-verify" className="block text-[13px] font-medium text-muted mb-1.5">
                      Verify token <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="wa-verify"
                      type="text"
                      placeholder="Your webhook verify token"
                      value={whatsappVerifyToken}
                      onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-surface border border-line p-3">
                    <Eyebrow className="mb-1.5">Setup steps</Eyebrow>
                    <ol className="list-inside list-decimal space-y-0.5 text-[12px] text-muted">
                      <li>Go to Meta Developer Portal</li>
                      <li>Create a WhatsApp Business app</li>
                      <li>Get your Phone Number ID and Access Token</li>
                      <li>Set a custom Verify Token for webhook validation</li>
                    </ol>
                  </div>
                </>
              )}

              {setupKey === 'zapier' && (
                <>
                  <div>
                    <label htmlFor="zap-hook" className="block text-[13px] font-medium text-muted mb-1.5">
                      Webhook URL <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="zap-hook"
                      type="url"
                      placeholder="https://hooks.zapier.com/…"
                      value={zapierWebhook}
                      onChange={(e) => setZapierWebhook(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-canvas border border-line text-[14px] text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-surface border border-line p-3">
                    <Eyebrow className="mb-1.5">Setup steps</Eyebrow>
                    <ol className="list-inside list-decimal space-y-0.5 text-[12px] text-muted">
                      <li>Create a new Zap in Zapier</li>
                      <li>Choose &quot;Webhooks by Zapier&quot; as the trigger</li>
                      <li>Copy the webhook URL provided</li>
                    </ol>
                  </div>
                </>
              )}
            </div>

            <Divider className="mt-6" />

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setSetupKey(null); resetSetupForm(); }} disabled={setupLoading}>
                Cancel
              </Button>
              <button
                onClick={handleSetupSubmit}
                disabled={setupLoading || !isSetupValid()}
                className="px-4 py-2 rounded-lg text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {setupLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>) : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect dialog */}
      {disconnectKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,15,15,0.32)', backdropFilter: 'blur(6px)' }}
            onClick={() => setDisconnectKey(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-canvas border border-line shadow-lg p-6">
            <Eyebrow>Confirm</Eyebrow>
            <h2
              className="font-display text-[20px] font-medium text-ink mt-2"
              style={{ letterSpacing: '-0.012em' }}
            >
              Disconnect {INTEGRATIONS.find((i) => i.key === disconnectKey)?.name}?
            </h2>
            <p className="mt-2 text-[13px] text-muted">The integration will stop working. You can reconnect any time.</p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDisconnectKey(null)} disabled={disconnectLoading}>Cancel</Button>
              <button
                onClick={handleDisconnect}
                disabled={disconnectLoading}
                className="px-4 py-2 rounded-lg text-[14px] font-medium bg-ink text-white hover:bg-ink-hover transition-colors disabled:opacity-40 inline-flex items-center gap-2"
              >
                {disconnectLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Disconnecting…</>) : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

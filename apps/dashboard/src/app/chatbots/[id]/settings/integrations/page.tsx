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
  ExternalLink,
} from 'lucide-react';

interface IntegrationDef {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBoxClass: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: 'slack',
    name: 'Slack',
    description: 'Connect your chatbot to Slack workspace',
    icon: <Hash className="h-5 w-5 text-[#BF56FF]" />,
    iconBoxClass: 'bg-[#BF56FF]/10',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    description: 'Deploy chatbot to Telegram channels',
    icon: <SendIcon className="h-5 w-5 text-[#60A5FA]" />,
    iconBoxClass: 'bg-[#60A5FA]/10',
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect via WhatsApp Business API',
    icon: <Phone className="h-5 w-5 text-[#22C55E]" />,
    iconBoxClass: 'bg-[#22C55E]/10',
  },
  {
    key: 'zapier',
    name: 'Zapier',
    description: 'Trigger workflows with Zapier webhooks',
    icon: <Zap className="h-5 w-5 text-[#F59E0B]" />,
    iconBoxClass: 'bg-[#F59E0B]/10',
  },
];

export default function IntegrationsPage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Setup dialog state
  const [setupKey, setSetupKey] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [whatsappPhoneId, setWhatsappPhoneId] = useState('');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState('');
  const [zapierWebhook, setZapierWebhook] = useState('');

  // Disconnect dialog state
  const [disconnectKey, setDisconnectKey] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

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
      case 'slack':
        return !!integrations.slack;
      case 'telegram':
        return !!integrations.telegram;
      case 'whatsapp':
        return !!integrations.whatsApp;
      case 'zapier':
        return !!integrations.zapier;
      default:
        return false;
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
      default:
        return null;
    }
  };

  const handleConnect = (key: string) => {
    if (key === 'slack') {
      integrationsApi
        .getSlackOAuthUrl(chatbotId)
        .then((url) => {
          window.location.href = url;
        })
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
        case 'slack':
          await integrationsApi.disconnectSlack(chatbotId);
          break;
        case 'telegram':
          await integrationsApi.disconnectTelegram(chatbotId);
          break;
        case 'whatsapp':
          await integrationsApi.disconnectWhatsApp(chatbotId);
          break;
        case 'zapier':
          await integrationsApi.disconnectZapier(chatbotId, 'new_lead');
          break;
        case 'googleDrive':
          await integrationsApi.disconnectGoogleDrive(chatbotId);
          break;
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
      case 'telegram':
        return telegramToken.trim().length > 0;
      case 'whatsapp':
        return (
          whatsappPhoneId.trim().length > 0 &&
          whatsappAccessToken.trim().length > 0 &&
          whatsappVerifyToken.trim().length > 0
        );
      case 'zapier':
        return zapierWebhook.trim().length > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
        <div>
          <div className="v4-shimmer rounded-lg" style={{ height: '32px', width: '180px' }} />
          <div className="v4-shimmer rounded-lg mt-2" style={{ height: '20px', width: '280px' }} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="v4-card p-5">
              <div className="flex items-start gap-4">
                <div className="v4-shimmer rounded-xl" style={{ height: '40px', width: '40px' }} />
                <div className="flex-1 space-y-2">
                  <div className="v4-shimmer rounded-lg" style={{ height: '20px', width: '100px' }} />
                  <div className="v4-shimmer rounded-lg" style={{ height: '16px', width: '200px' }} />
                </div>
              </div>
              <div className="mt-4">
                <div className="v4-shimmer rounded-lg" style={{ height: '36px', width: '90px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="v4-animate-in mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Connect your chatbot to external platforms
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INTEGRATIONS.map((integ) => {
          const connected = isConnected(integ.key);
          const info = getConnectionInfo(integ.key);

          return (
            <div
              key={integ.key}
              className="v4-card p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${integ.iconBoxClass}`}
                >
                  {integ.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {integ.name}
                    </h3>
                    {connected ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#22C55E]">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#71717A]">
                        <span className="w-2 h-2 rounded-full bg-[#52525B]" />
                        Not connected
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#A1A1AA]">
                    {integ.description}
                  </p>
                  {connected && info && (
                    <p className="mt-1 text-xs text-[#71717A]">{info}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {connected ? (
                  <button
                    onClick={() => setDisconnectKey(integ.key)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#EC4899]/30 text-[#EC4899] hover:bg-[#EC4899]/10 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(integ.key)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-[#08080A] hover:bg-white/90 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="rounded-2xl border border-[#60A5FA]/15 bg-[#60A5FA]/[0.03] p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-[#60A5FA] mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Need Help?</h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Check our integration guides for step-by-step setup instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Dialog */}
      {setupKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSetupKey(null);
              resetSetupForm();
            }}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0E0E10] border border-white/[0.08] shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-white">
              Connect {INTEGRATIONS.find((i) => i.key === setupKey)?.name}
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Enter the required credentials to connect this integration.
            </p>

            <div className="space-y-4 mt-5">
              {setupKey === 'telegram' && (
                <>
                  <div>
                    <label htmlFor="tg-token" className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                      Bot Token <span className="text-[#EC4899]">*</span>
                    </label>
                    <input
                      id="tg-token"
                      type="text"
                      placeholder="123456789:ABCdef..."
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <p className="mb-1.5 text-xs font-medium text-white">How to get a bot token:</p>
                    <ol className="list-inside list-decimal space-y-0.5 text-xs text-[#A1A1AA]">
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
                    <label htmlFor="wa-phone" className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                      Phone Number ID <span className="text-[#EC4899]">*</span>
                    </label>
                    <input
                      id="wa-phone"
                      type="text"
                      placeholder="e.g., 101234567890"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="wa-token" className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                      Access Token <span className="text-[#EC4899]">*</span>
                    </label>
                    <input
                      id="wa-token"
                      type="text"
                      placeholder="Your WhatsApp access token"
                      value={whatsappAccessToken}
                      onChange={(e) => setWhatsappAccessToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="wa-verify" className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                      Verify Token <span className="text-[#EC4899]">*</span>
                    </label>
                    <input
                      id="wa-verify"
                      type="text"
                      placeholder="Your webhook verify token"
                      value={whatsappVerifyToken}
                      onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <p className="mb-1.5 text-xs font-medium text-white">Setup steps:</p>
                    <ol className="list-inside list-decimal space-y-0.5 text-xs text-[#A1A1AA]">
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
                    <label htmlFor="zap-hook" className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                      Webhook URL <span className="text-[#EC4899]">*</span>
                    </label>
                    <input
                      id="zap-hook"
                      type="url"
                      placeholder="https://hooks.zapier.com/..."
                      value={zapierWebhook}
                      onChange={(e) => setZapierWebhook(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-white/[0.16] text-sm transition-colors"
                    />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <p className="mb-1.5 text-xs font-medium text-white">Setup steps:</p>
                    <ol className="list-inside list-decimal space-y-0.5 text-xs text-[#A1A1AA]">
                      <li>Create a new Zap in Zapier</li>
                      <li>Choose &quot;Webhooks by Zapier&quot; as trigger</li>
                      <li>Copy the webhook URL provided</li>
                    </ol>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSetupKey(null);
                  resetSetupForm();
                }}
                disabled={setupLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSetupSubmit}
                disabled={setupLoading || !isSetupValid()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#08080A] hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {setupLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      {disconnectKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDisconnectKey(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0E0E10] border border-white/[0.08] shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-[#EC4899]">
              Disconnect {INTEGRATIONS.find((i) => i.key === disconnectKey)?.name}?
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              This will remove the integration. You can reconnect it later.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDisconnectKey(null)}
                disabled={disconnectLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.10] text-[#A1A1AA] hover:text-white hover:border-white/[0.16] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnectLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#EC4899] text-white hover:bg-[#EC4899]/90 transition-colors disabled:opacity-50"
              >
                {disconnectLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Disconnecting...
                  </span>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

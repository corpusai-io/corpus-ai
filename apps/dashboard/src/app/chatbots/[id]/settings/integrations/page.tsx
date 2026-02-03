'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { integrationsApi } from '@/lib/api';
import { Button } from '@corpusai/ui';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';

interface Integration {
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config?: any;
}

export default function IntegrationsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationsApi.list(chatbotId);

      // Map backend data to UI structure
      const mapped: Integration[] = [
        {
          name: 'Slack',
          description: 'Connect your chatbot to Slack workspace',
          icon: '💬',
          connected: !!data.slack?.teamId,
          config: data.slack,
        },
        {
          name: 'Zapier',
          description: 'Trigger workflows with Zapier webhooks',
          icon: '⚡',
          connected: data.zapier?.length > 0,
          config: data.zapier,
        },
        {
          name: 'Google Drive',
          description: 'Sync files from Google Drive folders',
          icon: '📁',
          connected: !!data.googleDrive?.profileId,
          config: data.googleDrive,
        },
        {
          name: 'Telegram',
          description: 'Deploy chatbot to Telegram channels',
          icon: '📱',
          connected: !!data.telegram?.botToken,
          config: data.telegram,
        },
        {
          name: 'WhatsApp',
          description: 'Connect via WhatsApp Business API',
          icon: '💚',
          connected: !!data.whatsApp?.phoneNumberId,
          config: data.whatsApp,
        },
      ];

      setIntegrations(mapped);
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (name: string) => {
    if (name === 'Slack') {
      // Redirect to Slack OAuth
      const oauthUrl = await integrationsApi.getSlackOAuthUrl(chatbotId);
      window.location.href = oauthUrl;
    } else if (name === 'Google Drive') {
      alert('Google Drive OAuth coming soon');
    } else {
      alert(`${name} integration coming soon`);
    }
  };

  const handleDisconnect = async (name: string) => {
    if (!confirm(`Disconnect ${name}?`)) return;

    try {
      if (name === 'Slack') {
        await integrationsApi.disconnectSlack(chatbotId);
      } else if (name === 'Google Drive') {
        await integrationsApi.disconnectGoogleDrive(chatbotId);
      }
      loadIntegrations();
    } catch (err: any) {
      alert('Failed to disconnect: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BF56FF] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/chatbots/${chatbotId}/settings`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-2 text-gray-600">
            Connect your chatbot to external platforms
          </p>
        </div>

        {/* Integration Cards */}
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-white text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      {integration.connected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {integration.description}
                    </p>
                    {integration.connected && integration.config && (
                      <div className="mt-2 text-xs text-gray-500">
                        {integration.name === 'Slack' && (
                          <span>Team: {integration.config.teamId}</span>
                        )}
                        {integration.name === 'Zapier' && (
                          <span>
                            {integration.config.length} webhook(s) configured
                          </span>
                        )}
                        {integration.name === 'Google Drive' && (
                          <span>Profile: {integration.config.profileId}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {integration.connected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration.name)}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        Disconnect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration.name)}
                      className="bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] hover:opacity-90"
                      size="sm"
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">Need Help?</h3>
          <p className="mt-2 text-sm text-blue-800">
            Check our{' '}
            <a href="/docs" className="underline hover:text-blue-600">
              integration guides
            </a>{' '}
            for step-by-step setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
}

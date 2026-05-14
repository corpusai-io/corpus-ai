'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ChatWidget from '@/components/widget/ChatWidget';
import WidgetChat from '@/components/widget/WidgetChat';

interface LeadField {
  key: string;
  name: string;
  description?: string;
  required?: boolean;
}

interface TriggerConfig {
  triggerType: 'gated' | 'after_messages' | 'high_intent' | 'cant_answer' | 'exit_intent';
  messageThreshold?: number;
  formStyle: 'popup' | 'inline';
  enabled: boolean;
}

interface WidgetConfig {
  chatbotName: string;
  primaryColor: string;
  welcomeMessage: string;
  suggestedQuestions?: string[];
  showLeadForm: boolean;
  leadFields: LeadField[];
  leadFormTitle: string;
  triggerConfig: TriggerConfig | null;
}

const DEFAULT_CONFIG: WidgetConfig = {
  chatbotName: 'AI Assistant',
  primaryColor: '#171717',
  welcomeMessage: 'Hello! How can I help you today?',
  suggestedQuestions: [
    'What can you help me with?',
    'Tell me more about this',
  ],
  showLeadForm: false,
  leadFields: [],
  leadFormTitle: 'Contact Form',
  triggerConfig: null,
};

export default function WidgetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatbotId = params.chatbotId as string;
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);

  // When loaded inside an iframe (embed=true), render chat directly without the bubble
  const isEmbedded = searchParams.get('embed') === 'true';

  useEffect(() => {
    loadConfig();
  }, [chatbotId]);

  const loadConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      // Fetch chatbot info and customization in parallel (public endpoints)
      const [chatbotRes, customRes, fieldsRes] = await Promise.all([
        fetch(`${API_URL}/api/chatbots/${chatbotId}/public`).catch(() => null),
        fetch(`${API_URL}/api/customize/${chatbotId}/public`).catch(() => null),
        fetch(`${API_URL}/api/leads/${chatbotId}/fields`).catch(() => null),
      ]);

      const chatbotData = chatbotRes?.ok ? await chatbotRes.json() : {};
      const customData = customRes?.ok ? await customRes.json() : {};
      const fieldsData = fieldsRes?.ok ? await fieldsRes.json() : {};

      const chatbot = (chatbotData as any).chatbot || chatbotData;
      const custom = (customData as any).customization || {};
      const fieldsConfig = (fieldsData as any).fields || {};

      // Parse lead fields from config
      const leadFieldsList: LeadField[] = Array.isArray(fieldsConfig.fields)
        ? fieldsConfig.fields
        : [];

      // Parse trigger config
      const triggerConfig: TriggerConfig | null = fieldsConfig.triggerConfig
        ? {
            triggerType: fieldsConfig.triggerConfig.triggerType || 'gated',
            messageThreshold: fieldsConfig.triggerConfig.messageThreshold || 3,
            formStyle: fieldsConfig.triggerConfig.formStyle || 'popup',
            enabled: fieldsConfig.triggerConfig.enabled ?? false,
          }
        : null;

      const hasLeadCapture = triggerConfig?.enabled && leadFieldsList.length > 0;

      setConfig({
        chatbotName: chatbot.title || DEFAULT_CONFIG.chatbotName,
        primaryColor: custom.colors?.primary || DEFAULT_CONFIG.primaryColor,
        welcomeMessage:
          custom.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
        suggestedQuestions:
          custom.suggestedQuestions || DEFAULT_CONFIG.suggestedQuestions,
        showLeadForm: !!hasLeadCapture,
        leadFields: leadFieldsList,
        leadFormTitle: fieldsConfig.title || 'Contact Form',
        triggerConfig,
      });
    } catch {
      // Use defaults on error
    } finally {
      setReady(true);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
          style={{ borderColor: `${config.primaryColor} transparent transparent transparent` }}
        />
      </div>
    );
  }

  // Embedded mode: render WidgetChat directly (no bubble, fills the iframe)
  if (isEmbedded) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <WidgetChat
          chatbotId={chatbotId}
          chatbotName={config.chatbotName}
          primaryColor={config.primaryColor}
          welcomeMessage={config.welcomeMessage}
          suggestedQuestions={config.suggestedQuestions}
          showLeadForm={config.showLeadForm}
          leadFields={config.leadFields}
          leadFormTitle={config.leadFormTitle}
          triggerConfig={config.triggerConfig}
        />
      </div>
    );
  }

  // Standalone mode: render full ChatWidget with bubble (for direct URL access / preview)
  return (
    <div className="min-h-screen bg-transparent">
      <ChatWidget
        chatbotId={chatbotId}
        chatbotName={config.chatbotName}
        primaryColor={config.primaryColor}
        welcomeMessage={config.welcomeMessage}
        suggestedQuestions={config.suggestedQuestions}
        showLeadForm={config.showLeadForm}
        leadFields={config.leadFields}
        leadFormTitle={config.leadFormTitle}
        triggerConfig={config.triggerConfig}
      />
    </div>
  );
}

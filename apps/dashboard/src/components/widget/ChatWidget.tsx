'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import WidgetChat from './WidgetChat';

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

interface ChatWidgetProps {
  chatbotId: string;
  chatbotName: string;
  primaryColor: string;
  welcomeMessage: string;
  suggestedQuestions?: string[];
  showLeadForm: boolean;
  leadFields?: LeadField[];
  leadFormTitle?: string;
  triggerConfig?: TriggerConfig | null;
}

export default function ChatWidget({
  chatbotId,
  chatbotName,
  primaryColor,
  welcomeMessage,
  suggestedQuestions,
  showLeadForm,
  leadFields,
  leadFormTitle,
  triggerConfig,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Pulse animation stops after first interaction
  useEffect(() => {
    if (open) setHasInteracted(true);
  }, [open]);

  return (
    <>
      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-5 z-50 transition-all duration-300 ease-out ${
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
        style={{ width: 380, height: 520 }}
      >
        <WidgetChat
          chatbotId={chatbotId}
          chatbotName={chatbotName}
          primaryColor={primaryColor}
          welcomeMessage={welcomeMessage}
          suggestedQuestions={suggestedQuestions}
          showLeadForm={showLeadForm}
          leadFields={leadFields}
          leadFormTitle={leadFormTitle}
          triggerConfig={triggerConfig}
          onClose={() => setOpen(false)}
        />
      </div>

      {/* Floating bubble button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 ${
          !hasInteracted ? 'animate-pulse' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, #FC5990, ${primaryColor})`,
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}

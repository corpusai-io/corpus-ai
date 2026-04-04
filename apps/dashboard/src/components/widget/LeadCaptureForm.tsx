'use client';

import { useState } from 'react';
import { User, Mail, Phone, Building2, Send, FileText } from 'lucide-react';

interface LeadField {
  key: string;
  name: string;
  description?: string;
  required?: boolean;
}

interface LeadCaptureFormProps {
  primaryColor: string;
  chatbotName: string;
  title?: string;
  fields: LeadField[];
  formStyle: 'popup' | 'inline';
  onSubmit: (data: Record<string, string>) => void;
  onSkip: () => void;
}

const FIELD_ICONS: Record<string, typeof User> = {
  name: User,
  email: Mail,
  phone: Phone,
  company: Building2,
};

export default function LeadCaptureForm({
  primaryColor,
  chatbotName,
  title,
  fields,
  formStyle,
  onSubmit,
  onSkip,
}: LeadCaptureFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !values[field.key]?.trim()) {
        newErrors[field.key] = `${field.name} is required`;
      }
      if (field.key === 'email' && values[field.key]?.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.key])) {
          newErrors[field.key] = 'Invalid email format';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const trimmed: Record<string, string> = {};
    Object.entries(values).forEach(([k, v]) => {
      if (v.trim()) trimmed[k] = v.trim();
    });
    onSubmit(trimmed);
  };

  const getIcon = (key: string) => {
    const Icon = FIELD_ICONS[key] || FileText;
    return <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />;
  };

  const getInputType = (key: string) => {
    if (key === 'email') return 'email';
    if (key === 'phone') return 'tel';
    return 'text';
  };

  if (formStyle === 'inline') {
    return (
      <div className="mx-2 my-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-900 mb-3">
          {title || `Share your details with ${chatbotName}`}
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          {fields.map((field) => (
            <div key={field.key}>
              <div className="relative">
                {getIcon(field.key)}
                <input
                  type={getInputType(field.key)}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={`${field.name}${field.required ? ' *' : ''}`}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>
              {errors[field.key] && (
                <p className="mt-0.5 text-xs text-red-500">{errors[field.key]}</p>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Sending...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Popup style (full overlay)
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: primaryColor }}
      >
        <User className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title || `Welcome to ${chatbotName}`}
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Please share your details before we start
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <div className="relative">
              {getIcon(field.key)}
              <input
                type={getInputType(field.key)}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={`${field.description || field.name}${field.required ? ' *' : ''}`}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>
            {errors[field.key] && (
              <p className="mt-0.5 text-xs text-red-500">{errors[field.key]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Starting...' : 'Start Chat'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}

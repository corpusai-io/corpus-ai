import { create } from 'zustand';

/**
 * Preview Store
 * Manages preview mode state for chatbot customization
 */

export interface PreviewConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  welcomeMessage?: string;
  chatbotName?: string;
  systemPrompt?: string;
  gptVersion?: string;
  showCitations?: boolean;
  avatar?: string;
}

interface PreviewStore {
  // Preview mode
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;

  // Preview configuration
  previewConfig: PreviewConfig;
  setPreviewConfig: (config: PreviewConfig) => void;
  updatePreviewConfig: (updates: Partial<PreviewConfig>) => void;
  resetPreviewConfig: () => void;
}

const defaultConfig: PreviewConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
  },
  welcomeMessage: 'Hello! How can I help you today?',
  chatbotName: 'AI Assistant',
  systemPrompt: 'You are a helpful AI assistant.',
  gptVersion: 'gpt-4-turbo-preview',
  showCitations: true,
  avatar: '',
};

export const usePreviewStore = create<PreviewStore>()((set, get) => ({
  // Initial state
  previewMode: false,
  previewConfig: defaultConfig,

  // Actions
  setPreviewMode: (mode) => {
    set({ previewMode: mode });
  },

  setPreviewConfig: (config) => {
    set({ previewConfig: config });
  },

  updatePreviewConfig: (updates) => {
    set((state) => ({
      previewConfig: {
        ...state.previewConfig,
        ...updates,
        colors: updates.colors
          ? { ...state.previewConfig.colors, ...updates.colors }
          : state.previewConfig.colors,
      },
    }));
  },

  resetPreviewConfig: () => {
    set({ previewConfig: defaultConfig });
  },
}));

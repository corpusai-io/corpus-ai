import { create } from 'zustand';
import { persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware';

/**
 * Safe localStorage wrapper for SSR and Node.js compatibility
 */
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    if (typeof localStorage?.getItem !== 'function') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    if (typeof localStorage?.setItem !== 'function') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    if (typeof localStorage?.removeItem !== 'function') return;
    localStorage.removeItem(name);
  },
};

/**
 * Chatbot Store
 * Manages selected chatbot and chatbot list state
 */

export interface Chatbot {
  chatbotId: string;
  title: string;
  desc?: string;
  origin: string;
  username: string;
  indexName: string;
  language: string;
  status: 'BUILDING' | 'ACTIVE' | 'ERROR';
  step?: number;
  errorStep?: number;
  errorMessage?: string;
  accessMode: 'PUBLIC' | 'PRIVATE';
  createdAt: number;
  updatedAt: number;
}

interface ChatbotStore {
  // Selected chatbot
  selectedChatbot: string | null;
  setSelectedChatbot: (chatbotId: string | null) => void;

  // Chatbot list
  chatbots: Chatbot[];
  setChatbots: (chatbots: Chatbot[]) => void;
  addChatbot: (chatbot: Chatbot) => void;
  updateChatbot: (chatbotId: string, updates: Partial<Chatbot>) => void;
  removeChatbot: (chatbotId: string) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

// Create base store without persist
const createChatbotStore = () => subscribeWithSelector<ChatbotStore>((set, get) => ({
  // Initial state
  selectedChatbot: null,
  chatbots: [],
  isLoading: false,
  error: null,

  // Actions
  setSelectedChatbot: (chatbotId) => {
    set({ selectedChatbot: chatbotId });
  },

  setChatbots: (chatbots) => {
    set({ chatbots, isLoading: false });
  },

  addChatbot: (chatbot) => {
    set((state) => ({
      chatbots: [chatbot, ...state.chatbots],
    }));
  },

  updateChatbot: (chatbotId, updates) => {
    set((state) => ({
      chatbots: state.chatbots.map((bot) =>
        bot.chatbotId === chatbotId ? { ...bot, ...updates } : bot
      ),
    }));
  },

  removeChatbot: (chatbotId) => {
    set((state) => ({
      chatbots: state.chatbots.filter((bot) => bot.chatbotId !== chatbotId),
      selectedChatbot:
        state.selectedChatbot === chatbotId ? null : state.selectedChatbot,
    }));
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },
}));

// Apply persist only on client side
export const useChatbotStore = typeof window !== 'undefined' && typeof localStorage?.getItem === 'function'
  ? create<ChatbotStore>()(
      persist(
        createChatbotStore(),
        {
          name: 'chatbot-store',
          storage: createJSONStorage(() => safeLocalStorage),
          partialize: (state) => ({
            selectedChatbot: state.selectedChatbot,
            // Don't persist chatbots array - fetch fresh data
          }),
        }
      )
    )
  : create<ChatbotStore>()(createChatbotStore());

/**
 * Helper hooks for specific selections
 */

// Get selected chatbot object
export const useSelectedChatbot = () => {
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbot);
  const chatbots = useChatbotStore((state) => state.chatbots);
  return chatbots.find((bot) => bot.chatbotId === selectedChatbotId);
};

// Get chatbot by ID
export const useChatbotById = (chatbotId: string) => {
  return useChatbotStore((state) =>
    state.chatbots.find((bot) => bot.chatbotId === chatbotId)
  );
};

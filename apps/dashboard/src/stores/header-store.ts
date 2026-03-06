import { create } from 'zustand';

interface ChatHeaderContext {
  chatbotName: string;
  chatbotId: string;
  hasMessages: boolean;
  clearingHistory: boolean;
  onClear: () => void;
}

interface HeaderStore {
  chatContext: ChatHeaderContext | null;
  setChatContext: (ctx: ChatHeaderContext) => void;
  updateChatContext: (partial: Partial<ChatHeaderContext>) => void;
  clearChatContext: () => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  chatContext: null,
  setChatContext: (ctx) => set({ chatContext: ctx }),
  updateChatContext: (partial) =>
    set((state) =>
      state.chatContext ? { chatContext: { ...state.chatContext, ...partial } } : state
    ),
  clearChatContext: () => set({ chatContext: null }),
}));

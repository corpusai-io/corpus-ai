import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Data Store Records Store
 * Manages chatbot data sources (manual entries, files, URLs)
 */

export interface DataRecord {
  dataId: string;
  chatbotId: string;
  source: string;
  type: 'manual' | 'file' | 'web';
  content?: string;
  metadata?: Record<string, any>;
  size: number;
  createdAt: number;
  updatedAt?: number;
}

interface DataStoreState {
  // Records by chatbot ID
  recordsByChatbot: Record<string, DataRecord[]>;

  // Loading state
  isLoading: boolean;

  // Actions
  setRecords: (chatbotId: string, records: DataRecord[]) => void;
  addRecord: (chatbotId: string, record: DataRecord) => void;
  updateRecord: (
    chatbotId: string,
    dataId: string,
    updates: Partial<DataRecord>
  ) => void;
  removeRecord: (chatbotId: string, dataId: string) => void;
  clearRecords: (chatbotId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useDataStore = create<DataStoreState>()(
  immer((set, get) => ({
    // Initial state
    recordsByChatbot: {},
    isLoading: false,

    // Actions
    setRecords: (chatbotId, records) => {
      set((state) => {
        state.recordsByChatbot[chatbotId] = records;
        state.isLoading = false;
      });
    },

    addRecord: (chatbotId, record) => {
      set((state) => {
        if (!state.recordsByChatbot[chatbotId]) {
          state.recordsByChatbot[chatbotId] = [];
        }
        state.recordsByChatbot[chatbotId].unshift(record);
      });
    },

    updateRecord: (chatbotId, dataId, updates) => {
      set((state) => {
        const records = state.recordsByChatbot[chatbotId];
        if (records) {
          const index = records.findIndex((r) => r.dataId === dataId);
          if (index !== -1) {
            records[index] = { ...records[index], ...updates };
          }
        }
      });
    },

    removeRecord: (chatbotId, dataId) => {
      set((state) => {
        const records = state.recordsByChatbot[chatbotId];
        if (records) {
          state.recordsByChatbot[chatbotId] = records.filter(
            (r) => r.dataId !== dataId
          );
        }
      });
    },

    clearRecords: (chatbotId) => {
      set((state) => {
        delete state.recordsByChatbot[chatbotId];
      });
    },

    setIsLoading: (loading) => {
      set({ isLoading: loading });
    },
  }))
);

/**
 * Helper hooks
 */

// Get records for a specific chatbot
export const useChatbotRecords = (chatbotId: string) => {
  return useDataStore((state) => state.recordsByChatbot[chatbotId] || []);
};

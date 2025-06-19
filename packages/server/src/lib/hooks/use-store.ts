import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UploadHistoryItem {
  id: string;
  cid: string;
  name: string;
  key: string;
  size: string;
  type: "file" | "directory";
  fileCount?: number; // For directories
  uploadedAt: string;
  downloadUrl: string;
  fileNames?: string[];
}

interface UploadHistoryStore {
  history: UploadHistoryItem[];
  addToHistory: (items: UploadHistoryItem | UploadHistoryItem[]) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryById: (id: string) => UploadHistoryItem | undefined;
}

export const useUploadHistory = create<UploadHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      
      addToHistory: (items) => {
        const itemsArray = Array.isArray(items) ? items : [items];
                 set((state) => ({
           history: [...itemsArray, ...state.history] // Add new items to the beginning
         }));
      },
      
      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter(item => item.id !== id),
        }));
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      getHistoryById: (id) => {
        return get().history.find(item => item.id === id);
      }
    }),
    {
      name: "portal-upload-history",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => {
        // Handle future migrations if needed
        return persistedState as UploadHistoryStore;
      }
    }
  )
)

// Temporary store for current upload session (not persisted)
interface UploadSessionStore {
  lastUploadResults: UploadResult[]
  setLastUploadResults: (results: UploadResult[]) => void
  clearLastUploadResults: () => void
}

interface UploadResult {
  cid: string
  name: string
  key: string
  size: string
}

export const useUploadSession = create<UploadSessionStore>((set) => ({
  lastUploadResults: [],
  setLastUploadResults: (results) => set({ lastUploadResults: results }),
  clearLastUploadResults: () => set({ lastUploadResults: [] })
}));

import { create } from 'zustand';

export interface NewsEntry {
  _id?: string;
  content: string;
  // keyword: string;
  // detailLevel: number;
  // timeRange: { from: string; to: string };
  // style: string;
  // focus?: string;
  generateAt: string;
}

interface NewsStore {
  entries: NewsEntry[];
  addEntry: (entry: NewsEntry) => void;
  clearEntries: () => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })), // 最新的放最前面
  clearEntries: () => set({ entries: [] }),
}));

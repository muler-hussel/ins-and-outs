import { create } from 'zustand';

export interface NewsEntry {
  _id?: string;
  content: string;
  keyword: string;
  focus?: string;
  timeMode: 'relative' | 'absolute';
  relativeAmount?: number;
  relativeUnit?:
    | 'second'
    | 'minute'
    | 'hour'
    | 'date'
    | 'month'
    | 'year';
  absoluteStart?: string;
  absoluteEnd?: string;
  detailLevel: number;
  style: string;
  generateAt: string;
  startPicker: 'date' | 'month' | 'year';
  endPicker:  'date' | 'month' | 'year';
  starred: boolean;
}

interface NewsStore {
  entries: NewsEntry[];
  addEntry: (entry: NewsEntry) => void;
  setEntries: (entries: NewsEntry[]) => void;
  clearEntries: () => void;
  updateStarredState: (id: string, starred: boolean) => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),
  clearEntries: () => set({ entries: [] }),

  updateStarredState: (id: string, starred: boolean) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry._id === id ? { ...entry, starred } : entry
      ),
    })),
}));

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
}

interface NewsStore {
  entries: NewsEntry[];
  addEntry: (entry: NewsEntry) => void;
  setEntries: (entries: NewsEntry[]) => void;
  clearEntries: () => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) =>
    set((state) => ({ entries: [...state.entries, entry] })),
  clearEntries: () => set({ entries: [] }),
}));

import { create } from 'zustand';

export type StarredTitles = {
  titleId: string;
  title: string;
  autoUpdate: boolean;
  updateFreqAmount?: number;
  updateFreqType?: 'second' | 'minute' | 'hour' | 'date' | 'month';
  relativeAmount: number;
  relativeUnit?: 'second' | 'minute' | 'hour' | 'date' | 'month' | 'year';
  lastCheckedAt: string;
  lastUpdatedAt: string;
  hasNew?: boolean;
};

export const useStarredStore = create<{
  starredTitles: StarredTitles[];
  setStarredTitles: (entries: StarredTitles[]) => void;
  markTitleAsUpdated: (titleId: string) => void;
  clearUpdateFlag: (titleId: string) => void;
}>(set => ({
  starredTitles: [],
  setStarredTitles: (entries) => set({ starredTitles: entries }),
  markTitleAsUpdated: (titleId) =>
    set(state => ({
      starredTitles: state.starredTitles.map(t =>
        t.titleId === titleId ? { ...t, hasNew: true } : t
      )
    })),
  clearUpdateFlag: (titleId) =>
    set(state => ({
      starredTitles: state.starredTitles.map(t =>
        t.titleId === titleId ? { ...t, hasNew: false } : t
      )
    })),
}));

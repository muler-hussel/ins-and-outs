import { create } from 'zustand';

type StarredTitles = {
  title: string;
  autoUpdate: boolean;
  updateFreqAmount?: number;
  updateFreqType?: 'second' | 'minute' | 'hour' | 'date' | 'month';
  lastCheckedAt: string;
  lastUpdatedAt: string;
};

export const useStarredStore = create<{
  starredTitles: StarredTitles[];
  setStarredTitles: (entries: StarredTitles[]) => void;
}>(set => ({
  starredTitles: [],
  setStarredTitles: (entries) => set({ starredTitles: entries }),
}));

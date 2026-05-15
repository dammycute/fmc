import type { StateCreator } from 'zustand';
import type { StoreState } from '../types';
import type { NewsStory } from '../../types/game';

export interface NewsSlice {
  news: NewsStory[];
  generateNews: (story: Omit<NewsStory, 'id' | 'week' | 'season'>) => void;
}

export const createNewsSlice: StateCreator<
  StoreState,
  [],
  [],
  NewsSlice
> = (set, get) => ({
  news: [],

  generateNews: (story) => {
    const state = get();
    const id = Math.random().toString(36).substring(2, 11);
    set({
      news: [
        {
          ...story,
          id,
          week: state.currentWeek,
          season: state.currentSeason
        },
        ...state.news
      ].slice(0, 100)
    });
  },
});

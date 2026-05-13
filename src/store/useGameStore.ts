import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createClubSlice, type ClubSlice } from './slices/clubSlice';
import { createSquadSlice, type SquadSlice } from './slices/squadSlice';
import { createMatchSlice, type MatchSlice } from './slices/matchSlice';
import { createNewsSlice, type NewsSlice } from './slices/newsSlice';

type StoreState = GameSlice & ClubSlice & SquadSlice & MatchSlice & NewsSlice;

export const useGameStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createGameSlice(...args),
      ...createClubSlice(...args),
      ...createSquadSlice(...args),
      ...createMatchSlice(...args),
      ...createNewsSlice(...args),
    }),
    {
      name: 'chairman-game-storage',
    }
  )
);
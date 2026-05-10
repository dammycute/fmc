import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createGameSlice } from './slices/gameSlice';
import type { GameSlice } from './slices/gameSlice';
import { createClubSlice } from './slices/clubSlice';
import type { ClubSlice } from './slices/clubSlice';
import { createSquadSlice } from './slices/squadSlice';
import type { SquadSlice } from './slices/squadSlice';
import { createMatchSlice } from './slices/matchSlice';
import type { MatchSlice } from './slices/matchSlice';
import { createNewsSlice } from './slices/newsSlice';
import type { NewsSlice } from './slices/newsSlice';

export type MainStore = GameSlice & ClubSlice & SquadSlice & MatchSlice & NewsSlice;

export const useGameStore = create<MainStore>()(
  persist(
    (set, get, api) => ({
      ...createGameSlice(set, get, api),
      ...createClubSlice(set, get, api),
      ...createSquadSlice(set, get, api),
      ...createMatchSlice(set, get, api),
      ...createNewsSlice(set, get, api),
    }),
    {
      name: 'football-chairman-storage',
      version: 13,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version < 13) {
          // Force reset or meaningful migration
          return {}; // Reset for total rethink
        }
        return persistedState;
      },
    }
  )
);

import type { StateCreator } from 'zustand';
import { type GameState } from '../../types/game';
import { generateFixtures } from '../../utils/fixtureGenerator';
import { generateInitialData, generatePlayer, getRandomElement } from '../../utils/dataGenerator';

import { processAITransfers } from '../../utils/transferEngine';
import { client } from '../../api/client';


export interface GameSlice {
  currentSeason: number;
  currentWeek: number;
  isTransferWindowOpen: boolean;
  userClubId: string | null;
  hasActiveSession: boolean;
  personalBalance: number;
  initializeGame: () => Promise<void>;
  syncData: () => Promise<void>;
  advanceWeek: () => Promise<void>;
  setGameState: (state: Partial<GameState>) => void;
  skipWeeks: (weeks: number) => Promise<void>;
}

export const createGameSlice: StateCreator<
  GameSlice & any,
  [],
  [],
  GameSlice
> = (set, get) => ({
  currentSeason: 2024,
  currentWeek: 1,
  isTransferWindowOpen: false,
  userClubId: null,
  hasActiveSession: false,
  personalBalance: 0,

  initializeGame: async () => {
    // For a fresh start, we still need the backend data (leagues, clubs, players)
    // but without the user session state.
    await get().syncData();
  },

  syncData: async () => {
    console.log("SYNC STARTING...");
    try {
      const [gameStateResponse, clubsData, playersData, managersData, staffData, newsData, leaguesData] = await Promise.all([
        client.getGameState(),
        client.getClubs({ page_size: 1000 }), // Ensure we get all clubs
        client.getPlayers({ limit: 1000 }),
        client.getManagers({ limit: 500 }),
        client.getStaff({ limit: 500 }),
        client.getNews({ limit: 100 }),
        client.getLeagues()
      ]);

      const normalize = (data: any) => {
        const items = Array.isArray(data) ? data : (data?.results || []);
        return items.map((item: any) => ({ ...item, id: String(item.id) }));
      };

      // API returns a list or a single object for game-state
      const gameState = Array.isArray(gameStateResponse) ? gameStateResponse[0] : gameStateResponse;
      console.log("SYNC DEBUG - gameStateResponse:", gameStateResponse);
      console.log("SYNC DEBUG - gameState:", gameState);
      console.log("SYNC DEBUG - gameState keys:", Object.keys(gameState || {}));
      console.log("SYNC DEBUG - leaguesData:", leaguesData);

      set({
        currentSeason: gameState.currentSeason,
        currentWeek: gameState.currentWeek,
        isTransferWindowOpen: gameState.isTransferWindowOpen,
        userClubId: gameState.userClubId ? String(gameState.userClubId) : null,
        hasActiveSession: !!gameState.userClubId,
        personalBalance: gameState.personalBalance || 1000000,
        shortlist: (gameState.shortlist || []).map(String),
        clubs: normalize(clubsData),
        players: normalize(playersData),
        managers: normalize(managersData),
        staff: normalize(staffData),
        news: normalize(newsData),
        leagues: normalize(leaguesData),
      });
    } catch (error) {
      console.error("Failed to sync data with backend:", error);
    }
  },

  setGameState: (state) => set((prev) => ({ ...prev, ...state })),

  advanceWeek: async () => {
    try {
      await client.advanceWeek();
      await get().syncData();
    } catch (error) {
      console.error("Failed to advance week:", error);
    }
  },


  skipWeeks: async (weeks) => {
    for (let i = 0; i < weeks; i++) {
      await get().advanceWeek();
    }
  },
});
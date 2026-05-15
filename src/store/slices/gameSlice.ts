import type { StateCreator } from 'zustand';
import { type GameState } from '../../types/game';
import { client } from '../../api/client';


export interface GameSlice {
  currentSeason: number;
  currentWeek: number;
  isTransferWindowOpen: boolean;
  userClubId: string | null;
  hasActiveSession: boolean;
  personalBalance: number;
  isSyncing: boolean;
  isOffline: boolean;
  syncError: string | null;
  lastSync: number | null;
  initializeGame: () => Promise<void>;
  fetchAllPages: (fetchPage: (params: any) => Promise<any>, params?: any) => Promise<any[]>;
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
  isSyncing: false,
  isOffline: false,
  syncError: null,
  lastSync: null,

  initializeGame: async () => {
    const { syncData } = get();
    set({ isSyncing: true });
    
    try {
      console.log("Initializing game state...");
      const [gameStateResponse, clubsData, leaguesData] = await Promise.all([
        client.getGameState(),
        get().fetchAllPages(client.getClubs),
        client.getLeagues(),
      ]);

      const normalize = (data: any) => {
        const items = Array.isArray(data) ? data : (data?.results || []);
        return items.map((item: any) => ({ ...item, id: String(item.id) }));
      };

      const gameState = Array.isArray(gameStateResponse) ? gameStateResponse[0] : gameStateResponse;
      const clubs = normalize(clubsData).map((club: any) => ({
        ...club,
        leagueId: club.leagueId ? String(club.leagueId) : club.leagueId,
      }));

      console.log(`Loaded ${clubs.length} clubs and ${Array.isArray(leaguesData) ? leaguesData.length : 0} leagues.`);

      set({
        currentSeason: gameState.currentSeason || 2024,
        currentWeek: gameState.currentWeek || 1,
        isTransferWindowOpen: gameState.isTransferWindowOpen ?? true,
        personalBalance: gameState.personalBalance || 0,
        userClubId: gameState.userClubId ? String(gameState.userClubId) : null,
        clubs,
        leagues: normalize(leaguesData),
        hasActiveSession: !!gameState.userClubId,
        isSyncing: false
      });

      // If we have an active session, sync the rest of the data
      if (gameState.userClubId) {
        await syncData();
      }
    } catch (error) {
      console.error("Failed to initialize world:", error);
      set({ isSyncing: false });
      throw error;
    }
  },

  fetchAllPages: async (fetchPage: (params: any) => Promise<any>, params: any = {}) => {
    try {
      const firstPage = await fetchPage({ ...params, page_size: 1000 });
      if (Array.isArray(firstPage)) return firstPage;

      const results = [...(firstPage?.results || [])];
      let next = firstPage?.next;
      let page = 2;

      while (next) {
        const pageData = await fetchPage({ ...params, page_size: 1000, page });
        results.push(...(pageData?.results || []));
        next = pageData?.next;
        page += 1;
        if (page > 10) break; // Safety break
      }

      return results;
    } catch (error) {
      console.error("Error in fetchAllPages:", error);
      return [];
    }
  },

  syncData: async () => {
    const { fetchAllPages } = get();
    set({ isSyncing: true });
    
    try {
      console.log("Syncing all game data...");
      const [
        gameStateResponse,
        clubsData,
        playersData,
        managersData,
        staffData,
        newsData,
        leaguesData,
        matchesData,
        bidsData,
        requestsData,
        scoutData
      ] = await Promise.all([
        client.getGameState(),
        fetchAllPages(client.getClubs),
        fetchAllPages(client.getPlayers),
        fetchAllPages(client.getManagers),
        fetchAllPages(client.getStaff),
        client.getNews({ page_size: 100 }),
        client.getLeagues(),
        fetchAllPages(client.getMatches),
        fetchAllPages(client.getTransferBids),
        fetchAllPages(client.getTransferRequests),
        fetchAllPages(client.getScoutAssignments),
      ]);

      const normalize = (data: any) => {
        if (!data) return [];
        const items = Array.isArray(data) ? data : (data?.results || []);
        return items.map((item: any) => ({ ...item, id: String(item.id) }));
      };

      const gameState = Array.isArray(gameStateResponse) ? gameStateResponse[0] : gameStateResponse;
      
      const players = normalize(playersData).map((player: any) => ({
        ...player,
        clubId: player.clubId ? String(player.clubId) : player.clubId,
      }));

      const managers = normalize(managersData).map((manager: any) => ({
        ...manager,
        clubId: manager.clubId ? String(manager.clubId) : manager.clubId,
        philosophy: manager.preferredStyle || 'BALANCED',
      }));

      const clubs = normalize(clubsData).map((club: any) => ({
        ...club,
        leagueId: club.leagueId ? String(club.leagueId) : club.leagueId,
      }));

      const staff = normalize(staffData).map((s: any) => ({
        ...s,
        clubId: s.clubId ? String(s.clubId) : s.clubId,
      }));

      const scoutAssignments = normalize(scoutData).map((as: any) => ({
        ...as,
        clubId: as.clubId ? String(as.clubId) : null,
        scoutId: as.scoutId ? String(as.scoutId) : null,
        reports: (as.reports || []).map((report: any) => ({
          ...report,
          id: String(report.id),
          playerId: report.playerId ? String(report.playerId) : report.playerId,
          scoutId: report.scoutId ? String(report.scoutId) : report.scoutId,
        }))
      }));

      console.log(`Sync complete. Players: ${players.length}, Clubs: ${clubs.length}`);

      set({
        currentSeason: gameState.currentSeason || 2024,
        currentWeek: gameState.currentWeek || 1,
        isTransferWindowOpen: gameState.isTransferWindowOpen ?? true,
        personalBalance: gameState.personalBalance || 0,
        userClubId: gameState.userClubId ? String(gameState.userClubId) : null,
        hasActiveSession: !!gameState.userClubId,
        shortlist: (gameState.shortlist || []).map(String),
        clubs,
        players,
        managers,
        staff,
        leagues: normalize(leaguesData),
        matches: normalize(matchesData).map((m: any) => ({
          ...m,
          homeClubId: String(m.homeClubId),
          awayClubId: String(m.awayClubId),
          leagueId: String(m.leagueId),
        })),
        transferBids: normalize(bidsData).map((bid: any) => ({
          ...bid,
          playerId: String(bid.playerId),
          fromClubId: String(bid.fromClubId),
          toClubId: String(bid.toClubId),
        })),
        transferRequests: normalize(requestsData).map((request: any) => ({
          ...request,
          managerId: String(request.managerId),
          clubId: String(request.clubId),
        })),
        scoutAssignments,
        news: normalize(newsData),
        isSyncing: false,
        isOffline: false,
        syncError: null,
        lastSync: Date.now()
      });
    } catch (error: any) {
      console.error("Failed to sync data with backend:", error);
      
      const isNetworkError = 
        error.name === 'TypeError' || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('unreachable');

      if (isNetworkError) {
        set({ isOffline: true, isSyncing: false });
      } else {
        // Data/Server error (e.g. 500)
        set({ syncError: error.message, isSyncing: false });
      }
    }
  },

  advanceWeek: async () => {
    try {
      set({ isSyncing: true });
      await client.advanceWeek();
      await get().syncData();
    } catch (error) {
      console.error("Failed to advance week:", error);
      set({ isSyncing: false });
    }
  },

  skipWeeks: async (weeks: number) => {
    try {
      set({ isSyncing: true });
      await client.skipWeeks(weeks);
      await get().syncData();
    } catch (error) {
      console.error("Failed to skip weeks:", error);
      set({ isSyncing: false });
    }
  },

  setGameState: (state: Partial<GameState>) => {
    set((prev: any) => ({
      gameState: { ...prev.gameState, ...state }
    }));
  },
});

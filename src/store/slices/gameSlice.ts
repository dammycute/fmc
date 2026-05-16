import type { StateCreator } from 'zustand';
import type { StoreState } from '../types';
import { type GameState } from '../../types/game';
import { client } from '../../api/client';
import { normalizeData } from '../../utils/normalize';


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
  StoreState,
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
    set({ isSyncing: true, isOffline: false, syncError: null });
    
    try {
      console.log("Initializing game state...");
      const [gameStateResponse, clubsData, leaguesData] = await Promise.all([
        client.getGameState(),
        get().fetchAllPages(client.getClubs),
        client.getLeagues(),
      ]);

      const gameState = Array.isArray(gameStateResponse) ? gameStateResponse[0] : gameStateResponse;
      const clubs = normalizeData(clubsData).map((club: any) => ({
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
        leagues: normalizeData(leaguesData),
        hasActiveSession: !!gameState.userClubId,
        isSyncing: false
      });

      if (gameState.userClubId) {
        await syncData();
      }
    } catch (error: any) {
      console.error("Failed to initialize world:", error);
      const isNetworkError = 
        error.name === 'TypeError' || 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.message?.includes('unreachable') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ECONNREFUSED');

      if (isNetworkError) {
        set({ isOffline: true, isSyncing: false, syncError: 'Cannot connect to the game server. Make sure the backend is running on port 8000.' });
      } else {
        set({ isSyncing: false, syncError: error.message || 'Failed to initialize game data' });
      }
    }
  },

  fetchAllPages: async (fetchPage: (params: any) => Promise<any>, params: any = {}) => {
    try {
      const pageSize = params.page_size || 1000;
      const firstPage = await fetchPage({ ...params, page_size: pageSize });
      if (Array.isArray(firstPage)) return firstPage;

      const results = [...(firstPage?.results || [])];
      let next = firstPage?.next;
      let page = 2;

      while (next) {
        const pageData = await fetchPage({ ...params, page_size: pageSize, page });
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

      const gameState = Array.isArray(gameStateResponse) ? gameStateResponse[0] : gameStateResponse;
      
      const players = normalizeData(playersData).map((player: any) => ({
        ...player,
        clubId: player.clubId ? String(player.clubId) : player.clubId,
      }));

      const managers = normalizeData(managersData).map((manager: any) => ({
        ...manager,
        clubId: manager.clubId ? String(manager.clubId) : manager.clubId,
        philosophy: manager.preferredStyle || 'BALANCED',
      }));

      const clubs = normalizeData(clubsData).map((club: any) => ({
        ...club,
        leagueId: club.leagueId ? String(club.leagueId) : club.leagueId,
      }));

      const staff = normalizeData(staffData).map((s: any) => ({
        ...s,
        clubId: s.clubId ? String(s.clubId) : s.clubId,
      }));

      const scoutAssignments = normalizeData(scoutData).map((as: any) => {
        const reports = (as.reports || []).map((report: any) => ({
          ...report,
          id: String(report.id),
          playerId: report.playerId ? String(report.playerId) : report.playerId,
          scoutId: report.scoutId ? String(report.scoutId) : report.scoutId,
        }));

        return {
          ...as,
          clubId: as.clubId ? String(as.clubId) : null,
          scoutId: as.scoutId ? String(as.scoutId) : null,
          playersFound: (as.playersFound && as.playersFound.length > 0)
            ? as.playersFound.map(String)
            : reports.map((r: any) => String(r.playerId)),
          reports
        };
      });

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
        leagues: normalizeData(leaguesData),
        matches: normalizeData(matchesData).map((m: any) => ({
          ...m,
          homeClubId: String(m.homeClubId),
          awayClubId: String(m.awayClubId),
          leagueId: String(m.leagueId),
        })),
        transferBids: normalizeData(bidsData).map((bid: any) => ({
          ...bid,
          playerId: String(bid.playerId),
          fromClubId: String(bid.fromClubId),
          toClubId: String(bid.toClubId),
        })),
        transferRequests: normalizeData(requestsData).map((request: any) => ({
          ...request,
          managerId: String(request.managerId),
          clubId: String(request.clubId),
        })),
        scoutAssignments,
        news: normalizeData(newsData),
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
    } catch (error: any) {
      console.error("Failed to advance week:", error);
      set({ isSyncing: false, syncError: error.message || 'Failed to advance week' });
    }
  },

  skipWeeks: async (weeks: number) => {
    try {
      set({ isSyncing: true });
      await client.skipWeeks(weeks);
      await get().syncData();
    } catch (error: any) {
      console.error("Failed to skip weeks:", error);
      set({ isSyncing: false, syncError: error.message || 'Failed to skip weeks' });
    }
  },

  setGameState: (partial: Partial<GameState>) => {
    set(partial as any);
  },
});

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type GameState, type Club, type Player, type Match } from '../types/game';
import { simulateMatch } from '../utils/matchEngine';
import { generateInitialData } from '../utils/dataGenerator';

interface GameStore extends GameState {
  // Actions
  initializeGame: () => void;
  setGameState: (state: Partial<GameState>) => void;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  buyPlayer: (playerId: string) => void;
  advanceWeek: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  currentWeek: 0,
  currentSeason: 2024,
  clubs: [],
  players: [],
  managers: [],
  leagues: [],
  matches: [],
  userClubId: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeGame: () => {
        const data = generateInitialData();
        set({
          ...data,
          currentWeek: 1,
          currentSeason: 2024,
          userClubId: data.clubs.find(c => c.isUserControlled)?.id || null,
          matches: [],
        });
      },

      setGameState: (state) => set((prev) => ({ ...prev, ...state })),

      updateClub: (clubId, updates) =>
        set((state) => ({
          clubs: state.clubs.map((club) =>
            club.id === clubId ? { ...club, ...updates } : club
          ),
        })),

      updatePlayer: (playerId, updates) =>
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId ? { ...player, ...updates } : player
          ),
        })),

      buyPlayer: (playerId) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        const userClub = state.clubs.find(c => c.id === state.userClubId);

        if (player && userClub && userClub.balance >= player.value && player.clubId !== userClub.id) {
          set({
            clubs: state.clubs.map(c => 
              c.id === userClub.id ? { ...c, balance: c.balance - player.value } : 
              c.id === player.clubId ? { ...c, balance: c.balance + player.value } : c
            ),
            players: state.players.map(p => 
              p.id === playerId ? { ...p, clubId: userClub.id } : p
            )
          });
        }
      },

      advanceWeek: () => {
        const state = get();
        const { currentWeek, currentSeason, clubs, players } = state;

        // 1. Generate Fixtures for the week
        const newMatches: Match[] = [];
        const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledClubs.length; i += 2) {
          const home = shuffledClubs[i];
          const away = shuffledClubs[i + 1];
          
          if (home && away) {
            const homePlayers = players.filter(p => p.clubId === home.id);
            const awayPlayers = players.filter(p => p.clubId === away.id);
            
            const match = simulateMatch(home, away, homePlayers, awayPlayers, currentWeek, currentSeason);
            newMatches.push(match);
          }
        }

        // 2. Update Finances
        const updatedClubs = clubs.map(club => {
          let balanceChange = 0;
          // Expenses: Wages
          const squadWages = players
            .filter(p => p.clubId === club.id)
            .reduce((sum, p) => sum + p.wage, 0);
          balanceChange -= squadWages;

          // Revenue: Ticket sales if home
          const homeMatch = newMatches.find(m => m.homeClubId === club.id);
          if (homeMatch) {
            const ticketPrice = 20;
            const attendance = Math.min(club.stadiumCapacity, club.fanbase * (0.8 + Math.random() * 0.4));
            balanceChange += attendance * ticketPrice;
          }

          return {
            ...club,
            balance: club.balance + balanceChange,
          };
        });

        // 3. Update Player Fitness/Morale (Simplified)
        const updatedPlayers = players.map(player => ({
          ...player,
          fitness: Math.min(100, player.fitness + 5), // Basic recovery
        }));

        set({
          currentWeek: currentWeek + 1,
          matches: [...state.matches, ...newMatches],
          clubs: updatedClubs,
          players: updatedPlayers,
        });

        // 4. Handle End of Season (e.g., after 38 weeks)
        if (currentWeek >= 38) {
          set({
            currentWeek: 1,
            currentSeason: currentSeason + 1,
          });
        }
      },

      resetGame: () => set(initialState),
    }),
    {
      name: 'football-chairman-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

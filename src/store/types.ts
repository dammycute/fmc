import type { GameSlice } from './slices/gameSlice';
import type { ClubSlice } from './slices/clubSlice';
import type { SquadSlice } from './slices/squadSlice';
import type { MatchSlice } from './slices/matchSlice';
import type { NewsSlice } from './slices/newsSlice';

export type StoreState = GameSlice & ClubSlice & SquadSlice & MatchSlice & NewsSlice;

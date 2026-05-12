import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  activeTab: string;
  isProcessing: boolean;
  selectedClubId: string | null;
  selectedPlayerId: string | null;
  showOnboarding: boolean;
  setActiveTab: (tab: string) => void;
  setIsProcessing: (val: boolean) => void;
  setSelectedClubId: (id: string | null) => void;
  setSelectedPlayerId: (id: string | null) => void;
  setShowOnboarding: (val: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'DASHBOARD',
      isProcessing: false,
      selectedClubId: null,
      selectedPlayerId: null,
      showOnboarding: false,
      setActiveTab: (activeTab) => set({ activeTab }),
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      setSelectedClubId: (selectedClubId) => set({ selectedClubId }),
      setSelectedPlayerId: (selectedPlayerId) => set({ selectedPlayerId }),
      setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
    }),
    {
      name: 'chairman-ui-storage',
    }
  )
);

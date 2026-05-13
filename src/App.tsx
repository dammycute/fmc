import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/screens/Dashboard';
import Squad from './components/screens/Squad';
import ManagerScreen from './components/screens/ManagerScreen';
import Finances from './components/screens/Finances';
import Facilities from './components/screens/Facilities';
import TransferMarket from './components/screens/TransferMarket';
import BoardRoom from './components/screens/BoardRoom';
import ClubMarket from './components/screens/ClubMarket';
import Onboarding from './components/screens/Onboarding';
import StaffScreen from './components/screens/StaffScreen';
import Schedule from './components/screens/Schedule';
import Scouting from './components/screens/Scouting';
import NewsFeed from './components/screens/NewsFeed';
import LeagueTable from './components/screens/LeagueTable';
import MatchSimulation from './components/screens/MatchSimulation';
import { Button } from './components/ui/button';

const App: React.FC = () => {
  const { initializeGame, syncData, currentSeason, currentWeek, news, userClubId, clubs, advanceWeek, prepareMatchday, finalizeMatchday, transferRequests, transferBids, hasActiveSession } = useGameStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMatchSimulation, setActiveMatchSimulation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use store's state to determine initial syncing need
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        if (hasActiveSession || userClubId) {
          await syncData();
        } else {
          // If no session/userClubId, we might still need to init the game state
          // (fetching leagues/clubs for onboarding)
          if (!userClubId) {
            await initializeGame();
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [syncData, initializeGame, hasActiveSession, userClubId]);

  const userClub = clubs.find(c => String(c.id) === String(userClubId));
  const pendingRequests = (transferRequests || []).filter(r => String(r.clubId) === String(userClubId) && r.status === 'PENDING');
  const pendingBids = (transferBids || []).filter(b => String(b.toClubId) === String(userClubId) && b.status === 'PENDING');

  if (isSyncing) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Syncing Game State...</p>
        </div>
      </div>
    );
  }

  if (!userClubId) {
    return <Onboarding onComplete={() => { }} />;
  }

  if (!userClub && !isSyncing) {
    return (
      <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Incompatible Save Data Detected</h2>
        <p className="text-zinc-500 max-w-md mb-8">We've updated the game engine with new financial and facility systems. Your previous save is no longer compatible.</p>
        <Button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-indigo-600 hover:bg-indigo-500 font-bold"
        >
          START NEW CAREER
        </Button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'squad': return <Squad />;
      case 'manager': return <ManagerScreen setActiveTab={setActiveTab} />;

      case 'finances': return <Finances />;
      case 'facilities': return <Facilities />;
      case 'scouting': return <Scouting />;
      case 'news': return <NewsFeed />;
      case 'leagues': return <LeagueTable />;
      case 'clubmarket': return <ClubMarket />;
      case 'staff': return <StaffScreen setActiveTab={setActiveTab} />;
      case 'transfer': return <TransferMarket />;
      case 'schedule': return <Schedule />;
      case 'boardroom': return <BoardRoom />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequests.length}
        pendingBidsCount={pendingBids.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 pb-24 overflow-y-auto min-w-0">
        <>
          {/* Header Stats */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex-shrink-0 p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Season {currentSeason} • Week {currentWeek}</h2>
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{userClub.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-tight">Balance</p>
                <p className="text-lg sm:text-xl font-mono text-emerald-400">£{((userClub.finances.balance || 0) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="h-10 w-px bg-white/5 hidden sm:block" />
              <Button
                size="lg"
                onClick={() => {
                  const match = prepareMatchday();
                  if (match) {
                    const simulated = (useGameStore.getState() as any).startUserMatch(match.id);
                    setActiveMatchSimulation(simulated || match);
                  } else {
                    setIsProcessing(true);
                    setTimeout(() => {
                      advanceWeek();
                      setIsProcessing(false);
                    }, 800);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 sm:px-8 shadow-lg shadow-indigo-600/20 text-sm sm:text-base"
              >
                CONTINUE
              </Button>
            </div>
          </div>

          {renderContent()}
        </>
      </main>

      {/* Global Footer / Ticker Placeholder */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 h-12 bg-black border-t border-white/5 flex items-center px-4 sm:px-8 z-40">
        <div className="flex items-center gap-4 text-xs text-zinc-500 overflow-hidden">
          <span className="font-bold text-indigo-400 shrink-0">NEWS TICKET</span>
          <div className="animate-marquee whitespace-nowrap">
            {news.length > 0 ? news[0].title : `Transfer window ${useGameStore.getState().isTransferWindowOpen ? 'OPEN' : 'CLOSED'} • ${userClub.name} prepared for next week • Manager confidence at ${userClub.boardConfidence}%`}
          </div>
        </div>
      </footer>

      {activeMatchSimulation && (
        <MatchSimulation
          match={activeMatchSimulation}
          onComplete={(result: any) => {
            finalizeMatchday(result);
            setActiveMatchSimulation(null);
            setActiveTab('dashboard');
          }}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center transition-all duration-500 animate-in fade-in">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Processing Week {currentWeek}</h2>
            <p className="text-zinc-400 mt-2">Simulating matches and calculating results...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
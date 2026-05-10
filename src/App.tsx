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
import StaffMarket from './components/screens/StaffMarket';
import Schedule from './components/screens/Schedule';
import Scouting from './components/screens/Scouting';
import NewsFeed from './components/screens/NewsFeed';
import LeagueTable from './components/screens/LeagueTable';
import MatchSimulation from './components/screens/MatchSimulation';
import { Button } from './components/ui/button';

const App: React.FC = () => {
  const { initializeGame, currentWeek, currentSeason, userClubId, clubs, advanceWeek, prepareMatchday, finalizeMatchday, transferRequests, transferBids } = useGameStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMatchSimulation, setActiveMatchSimulation] = useState<any>(null);

  useEffect(() => {
    if (!userClubId) {
      initializeGame();
    }
  }, [userClubId, initializeGame]);

  const userClub = clubs.find(c => c.id === userClubId);
  const pendingRequests = transferRequests.filter(r => r.clubId === userClubId && r.status === 'PENDING');
  const pendingBids = transferBids.filter(b => b.toClubId === userClubId && b.status === 'PENDING');

  if (!userClub || !userClub.finances) {
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
      case 'manager': return <ManagerScreen />;
      case 'finances': return <Finances />;
      case 'facilities': return <Facilities />;
      case 'scouting': return <Scouting />;
      case 'news': return <NewsFeed />;
      case 'leagues': return <LeagueTable />;
      case 'clubmarket': return <ClubMarket />;
      case 'staff': return <StaffMarket />;
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
      />
      
      <main className="flex-1 ml-64 p-8 pb-24 overflow-y-auto">
        {!userClubId ? (
          <ClubMarket />
        ) : (
          <>
            {/* Header Stats */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Season {currentSeason} • Week {currentWeek}</h2>
            <div className="flex items-center gap-4 mt-1">
              <h1 className="text-3xl font-bold text-white">{userClub.name}</h1>
              <span className="px-2 py-1 rounded bg-white/5 text-xs text-zinc-400 font-mono">ID: {userClub.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-tight">Balance</p>
              <p className="text-xl font-mono text-emerald-400">£{((userClub.finances.balance || 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <Button 
              size="lg"
              onClick={() => {
                const match = prepareMatchday();
                if (match) {
                  setActiveMatchSimulation(match);
                } else {
                  advanceWeek();
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-600/20"
            >
              CONTINUE
            </Button>
          </div>
        </div>

            {renderContent()}
          </>
        )}
      </main>

      {/* Global Footer / Ticker Placeholder */}
      <footer className="fixed bottom-0 left-64 right-0 h-12 bg-black border-t border-white/5 flex items-center px-8 z-40">
        <div className="flex items-center gap-4 text-xs text-zinc-500 overflow-hidden">
          <span className="font-bold text-indigo-400 shrink-0">NEWS TICKET</span>
          <div className="animate-marquee whitespace-nowrap">
            Transfer window remains closed • {userClub.name} prepared for next fixture • Manager confidence at {userClub.boardConfidence}%
          </div>
        </div>
      </footer>
      {activeMatchSimulation && (
        <MatchSimulation 
          match={activeMatchSimulation} 
          onComplete={(result) => {
            finalizeMatchday(result);
            setActiveMatchSimulation(null);
          }} 
        />
      )}
    </div>
  );
};

export default App;

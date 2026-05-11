import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Activity, Timer, 
  ChevronRight, AlertCircle, Zap,
  TrendingUp, TrendingDown, Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { type Match, type MatchEvent, type Player } from '../../types/game';
import TacticsBoard from '../ui/TacticsBoard';
import PlayerModal from '../ui/PlayerModal';

interface MatchSimulationProps {
  match: Match;
  onComplete: (match: Match) => void;
}

const MatchSimulation: React.FC<MatchSimulationProps> = ({ match, onComplete }) => {
  const { clubs, players, toggleTransferList, userClubId, makeTransferBid } = useGameStore();
  const [minute, setMinute] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'tactics'>('feed');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  const homeClub = clubs.find(c => c.id === match.homeClubId);
  const awayClub = clubs.find(c => c.id === match.awayClubId);
  
  const homePlayers = players.filter(p => p.clubId === match.homeClubId);
  const awayPlayers = players.filter(p => p.clubId === match.awayClubId);

  // Score tracking for the simulation
  const [currentHomeScore, setCurrentHomeScore] = useState(0);
  const [currentAwayScore, setCurrentAwayScore] = useState(0);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleMakeBid = (playerId: string) => {
    if (!selectedPlayer || !userClubId) return;
    // Basic automatic bid at market value
    makeTransferBid(playerId, userClubId, selectedPlayer.value);
    setIsPlayerModalOpen(false); // Close modal on bid to show feedback elsewhere? Or keep open?
    // User probably wants feedback
  };

  useEffect(() => {
    if (minute >= 90) {
      setIsFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setMinute(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setIsFinished(true);
          return 90;
        }
        return prev + 1;
      });
    }, 100); 

    return () => clearInterval(interval);
  }, [minute]);

  useEffect(() => {
    const minuteEvents = match.events.filter(e => e.minute === minute);
    if (minuteEvents.length > 0) {
      setVisibleEvents(prev => [...minuteEvents, ...prev]);
      
      minuteEvents.forEach(e => {
        if (e.type === 'GOAL') {
          if (e.clubId === match.homeClubId) {
             setCurrentHomeScore(prev => prev + 1);
          } else {
             setCurrentAwayScore(prev => prev + 1);
          }
        }
      });
    }
  }, [minute, match.events, match.homeClubId]);

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <div className="relative flex-1 flex flex-col max-w-6xl mx-auto w-full p-8 gap-8 overflow-y-auto custom-scrollbar">
        {/* Match Header / Scoreboard */}
        <Card className="bg-zinc-900/50 border-white/5 shadow-2xl backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-12">
            <div className="flex items-center justify-between gap-12">
              <div className="flex-1 flex flex-col items-center gap-6">
                <div 
                  className="w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4"
                  style={{ backgroundColor: homeClub?.primaryColor, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {homeClub?.name.charAt(0)}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{homeClub?.name}</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">HOME TEAM</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8">
                <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                  <Timer className={cn("w-4 h-4", isFinished ? "text-zinc-500" : "text-indigo-400 animate-pulse")} />
                  <span className="text-xl font-black font-mono text-white tracking-tighter">
                    {minute}'
                  </span>
                </div>
                
                <div className="flex items-center gap-12">
                  <span className="text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl">{currentHomeScore}</span>
                  <span className="text-4xl font-black text-zinc-800">:</span>
                  <span className="text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl">{currentAwayScore}</span>
                </div>

                <Badge className={cn(
                  "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest",
                  isFinished ? "bg-zinc-800 text-zinc-400" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  {isFinished ? 'FULL TIME' : 'LIVE SIMULATION'}
                </Badge>
              </div>

              <div className="flex-1 flex flex-col items-center gap-6">
                <div 
                  className="w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl border-4"
                  style={{ backgroundColor: awayClub?.primaryColor, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {awayClub?.name.charAt(0)}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{awayClub?.name}</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-1">AWAY TEAM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Switcher */}
        <div className="flex items-center gap-4 border-b border-white/5">
            <button 
                onClick={() => setActiveSubTab('feed')}
                className={cn(
                    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                    activeSubTab === 'feed' ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                MATCH FEED
                {activeSubTab === 'feed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400 rounded-t-full" />}
            </button>
            <button 
                onClick={() => setActiveSubTab('tactics')}
                className={cn(
                    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                    activeSubTab === 'tactics' ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                TACTICAL SETUP
                {activeSubTab === 'tactics' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400 rounded-t-full" />}
            </button>
        </div>

        {/* Live Feed & Stats */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden min-h-0">
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
            {activeSubTab === 'feed' ? (
              <>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> MATCHDAY LOG
                </h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                   {visibleEvents.map((event, i) => (
                     <div key={i} className={cn(
                       "p-6 rounded-3xl border animate-in slide-in-from-right-4 duration-500",
                       event.type === 'GOAL' ? "bg-emerald-500/10 border-emerald-500/20" : 
                       event.type === 'INJURY' ? "bg-rose-500/10 border-rose-500/20" : "bg-zinc-900 border-white/5"
                     )}>
                       <div className="flex items-center gap-4">
                         <span className="text-xl font-black text-white/20 italic">{event.minute}'</span>
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center",
                           event.type === 'GOAL' ? "bg-emerald-500/20 text-emerald-400" : 
                           event.type === 'INJURY' ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 text-zinc-500"
                         )}>
                            {event.type === 'GOAL' ? <Zap className="w-5 h-5 fill-current" /> : 
                             event.type === 'INJURY' ? <AlertCircle className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         </div>
                         <p className={cn(
                           "font-black text-lg tracking-tight",
                           event.type === 'GOAL' ? "text-white" : "text-zinc-400"
                         )}>
                           {event.description}
                         </p>
                       </div>
                     </div>
                   ))}
                   {visibleEvents.length === 0 && (
                     <div className="h-full flex items-center justify-center py-20 text-center opacity-20 grayscale">
                        <div className="space-y-4">
                          <Users className="w-16 h-16 mx-auto" />
                          <p className="text-xs font-black uppercase tracking-[0.4em]">Battle for dominance in progress</p>
                        </div>
                     </div>
                   )}
                </div>
              </>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-8 h-full overflow-hidden">
                <div className="flex flex-col gap-4">
                  <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2">{homeClub?.name} TACTICS</h4>
                  <div className="flex-1 bg-zinc-950/50 rounded-3xl p-6 flex items-center justify-center border border-white/5">
                    <TacticsBoard 
                      formation={homeClub?.formation || '4-4-2'} 
                      startingLineup={homeClub?.startingLineup || {}} 
                      players={homePlayers}
                      variant="mini"
                      onPlayerClick={handlePlayerClick}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-[9px] font-black text-rose-400 uppercase tracking-widest px-2 text-right">{awayClub?.name} TACTICS</h4>
                  <div className="flex-1 bg-zinc-950/50 rounded-3xl p-6 flex items-center justify-center border border-white/5">
                    <TacticsBoard 
                      formation={awayClub?.formation || '4-4-2'} 
                      startingLineup={awayClub?.startingLineup || {}} 
                      players={awayPlayers}
                      variant="mini"
                      onPlayerClick={handlePlayerClick}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Stats */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2">Live Performance</h3>
            <Card className="bg-zinc-900 border-white/5 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      <span>POSSESSION</span>
                      <span className="text-white">{match.stats?.homePossession || 50}% - {match.stats?.awayPossession || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                       <div className="h-full bg-indigo-500" style={{ width: `${match.stats?.homePossession || 50}%` }} />
                       <div className="h-full bg-zinc-800" style={{ width: `${match.stats?.awayPossession || 50}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">HOME SHOTS</p>
                      <p className="text-2xl font-black text-white italic">{match.stats?.homeShots || 0}</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">AWAY SHOTS</p>
                      <p className="text-2xl font-black text-white italic">{match.stats?.awayShots || 0}</p>
                    </div>
                  </div>

                 <div className="pt-8 space-y-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <TrendingUp className="w-4 h-4 text-indigo-400" />
                       <span className="text-xs font-bold text-zinc-400">Tactical positioning solidifying</span>
                    </div>
                    {minute > 70 && (
                       <div className="flex items-center gap-3">
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-bold text-zinc-400">Squad fitness beginning to drop</span>
                       </div>
                    )}
                 </div>
              </CardContent>
            </Card>

             {isFinished && (
                <div className="space-y-4 animate-in zoom-in-95 duration-700">
                  <Button 
                    onClick={() => onComplete({ ...match, homeScore: currentHomeScore, awayScore: currentAwayScore })}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-16 rounded-3xl uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30"
                  >
                    FINALISE RESULTS
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>

      <PlayerModal 
        player={selectedPlayer}
        club={selectedPlayer?.clubId === homeClub?.id ? homeClub : awayClub || null}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onToggleTransferList={toggleTransferList}
        isUserPlayer={selectedPlayer?.clubId === userClubId}
        onMakeBid={handleMakeBid}
      />
    </div>
  );
};

export default MatchSimulation;

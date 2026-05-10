import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Trophy, Activity, Timer, 
  ChevronRight, AlertCircle, Zap,
  TrendingUp, TrendingDown, Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { type Match, type MatchEvent } from '../../types/game';

interface MatchSimulationProps {
  match: Match;
  onComplete: (match: Match) => void;
}

const MatchSimulation: React.FC<MatchSimulationProps> = ({ match, onComplete }) => {
  const { clubs } = useGameStore();
  const [minute, setMinute] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const homeClub = clubs.find(c => c.id === match.homeClubId);
  const awayClub = clubs.find(c => c.id === match.awayClubId);

  // Score tracking for the simulation
  const [currentHomeScore, setCurrentHomeScore] = useState(0);
  const [currentAwayScore, setCurrentAwayScore] = useState(0);

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
    }, 100); // Slightly faster simulation for better flow

    return () => clearInterval(interval);
  }, [minute]);

  useEffect(() => {
    // Find events for this minute
    const minuteEvents = match.events.filter(e => e.minute === minute);
    if (minuteEvents.length > 0) {
      setVisibleEvents(prev => [...minuteEvents, ...prev]);
      
      // Update scores if it's a goal
      minuteEvents.forEach(e => {
        if (e.type === 'GOAL') {
          if (e.description.includes(homeClub?.name || '')) {
             setCurrentHomeScore(prev => prev + 1);
          } else {
             setCurrentAwayScore(prev => prev + 1);
          }
        }
      });
    }
  }, [minute, match.events, homeClub, awayClub]);

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <div className="relative flex-1 flex flex-col max-w-6xl mx-auto w-full p-8 gap-8">
        {/* Match Header / Scoreboard */}
        <Card className="bg-zinc-900/50 border-white/5 shadow-2xl backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-12">
            <div className="flex items-center justify-between gap-12">
              {/* Home Team */}
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

              {/* Score & Timer */}
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

              {/* Away Team */}
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

        {/* Live Feed & Stats */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden min-h-0">
          {/* Commentary Feed */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
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
                       event.type === 'INJURY' ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-zinc-500"
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
          </div>

          {/* Real-time Stats */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2">Live Performance</h3>
            <Card className="bg-zinc-900 border-white/5 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                     <span>POSSESSION</span>
                     <span className="text-white">54% - 46%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-indigo-500" style={{ width: '54%' }} />
                      <div className="h-full bg-zinc-800" style={{ width: '46%' }} />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                     <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOTAL SHOTS</p>
                     <p className="text-2xl font-black text-white italic">{Math.floor(minute / 8)}</p>
                   </div>
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                     <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">PASS RATE</p>
                     <p className="text-2xl font-black text-white italic">82%</p>
                   </div>
                 </div>

                 <div className="pt-8 space-y-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <TrendingUp className="w-4 h-4 text-emerald-400" />
                       <span className="text-xs font-bold text-zinc-400">Team morale high after strong start</span>
                    </div>
                    {minute > 60 && (
                       <div className="flex items-center gap-3">
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-bold text-zinc-400">Players showing signs of fatigue</span>
                       </div>
                    )}
                 </div>
              </CardContent>
            </Card>

             {isFinished && (
                <div className="space-y-4 animate-in zoom-in-95 duration-700">
                  <Button 
                    onClick={() => onComplete(match)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-16 rounded-3xl uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30"
                  >
                    CONFIRM RESULT & PROCEED
                  </Button>
                  <p className="text-[10px] text-zinc-600 font-black text-center uppercase tracking-widest animate-pulse">
                    Click to finalize matchday
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSimulation;

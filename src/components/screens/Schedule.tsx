import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calendar, MapPin, 
  Trophy, 
  Activity, Star
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Schedule: React.FC = () => {
  const { userClubId, clubs, matches, currentWeek, currentSeason } = useGameStore();
  
  const userClub = clubs.find(c => c.id === userClubId);
  if (!userClub) return null;

  // Filter matches for user club, sorted by season and week
  const userMatches = matches
    .filter(m => m.homeClubId === userClubId || m.awayClubId === userClubId)
    .sort((a, b) => a.season !== b.season ? a.season - b.season : a.week - b.week);

  const upcomingMatches = userMatches.filter(m => !m.played && (m.season > currentSeason || (m.season === currentSeason && m.week >= currentWeek)));
  const completedMatches = userMatches.filter(m => m.played).reverse();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Fixture Schedule</h1>
          <p className="text-zinc-500 font-medium mt-1">{currentSeason}/{currentSeason + 1} League Campaign • Week {currentWeek}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-xl">
          <Calendar className="w-3 h-3" /> FULL CALENDAR
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Upcoming Matches */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Upcoming Fixtures</h2>
          {upcomingMatches.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl text-center">
              <Trophy className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">Season concluded. Awaiting new schedule.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {upcomingMatches.map((match) => {
                const isHome = match.homeClubId === userClubId;
                const opponentId = isHome ? match.awayClubId : match.homeClubId;
                const opponent = clubs.find(c => c.id === opponentId);
                const isNextMatch = match.week === currentWeek && match.season === currentSeason;

                return (
                  <Card key={match.id} className={cn(
                    "bg-zinc-900 border-white/5 overflow-hidden transition-all group",
                    isNextMatch ? "border-l-4 border-l-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-white/5" : "opacity-80"
                  )}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className={cn(
                          "w-full md:w-32 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/5",
                          isNextMatch ? "bg-indigo-500/5" : "bg-white/[0.01]"
                        )}>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Week</span>
                          <span className={cn("text-sm font-black italic", isNextMatch ? "text-indigo-400" : "text-white")}>{match.week}</span>
                        </div>
                        
                        <div className="flex-1 p-6 flex items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5 font-black text-zinc-700">
                                  {userClub.name.charAt(0)}
                                </div>
                                <span className="text-[8px] font-black text-zinc-500 uppercase mt-1">HOME</span>
                            </div>
                            
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-black text-white tracking-tight">
                                    {isHome ? userClub.name : opponent?.name}
                                  </h3>
                                  <span className="text-zinc-600 font-black text-xs">VS</span>
                                  <h3 className="text-xl font-black text-white tracking-tight">
                                    {isHome ? opponent?.name : userClub.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge className="bg-white/5 text-zinc-500 text-[8px] font-black h-4 px-1.5 uppercase">League Match</Badge>
                                    <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {isHome ? userClub.stadiumName : opponent?.stadiumName}
                                    </span>
                                </div>
                            </div>
                          </div>

                          <div className="hidden md:flex flex-col items-end gap-2">
                             {isNextMatch ? (
                               <Badge className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-lg animate-pulse">NEXT MATCH</Badge>
                             ) : (
                               <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Scheduled</span>
                             )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Recent Results Summary */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Recent Form</h2>
          <Card className="bg-zinc-900 border-white/5 shadow-2xl">
            <CardContent className="p-6 space-y-6">
              {completedMatches.length === 0 ? (
                <div className="py-10 text-center">
                  <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No results yet</p>
                </div>
              ) : (
                completedMatches.slice(0, 5).map((match) => {
                  const isHome = match.homeClubId === userClubId;
                  const opponent = clubs.find(c => c.id === (isHome ? match.awayClubId : match.homeClubId));
                  const userScore = isHome ? match.homeScore : match.awayScore;
                  const opponentScore = isHome ? match.awayScore : match.homeScore;
                  const result = userScore > opponentScore ? 'W' : userScore === opponentScore ? 'D' : 'L';

                  return (
                    <div key={match.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                          result === 'W' ? "bg-emerald-500/20 text-emerald-400" : 
                          result === 'D' ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                        )}>
                          {result}
                        </span>
                        <div>
                          <p className="text-xs font-black text-white">{opponent?.name}</p>
                          <p className="text-[8px] font-black text-zinc-600 uppercase">Week {match.week}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-white italic">{userScore} - {opponentScore}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Key Dates */}
          <Card className="bg-indigo-600/5 border border-indigo-600/10 p-6 rounded-3xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Star className="w-3 h-3 text-indigo-400" /> Season Milestones
            </h3>
            <div className="space-y-4">
              {[
                { date: 'Week 1', label: 'Season Launch' },
                { date: 'Week 19', label: 'Mid-Point Review' },
                { date: 'Week 38', label: 'Final Matchday' },
              ].map((m, _i) => (
                <div key={_i} className="flex justify-between items-center text-[10px]">
                  <span className="text-indigo-400 font-black uppercase">{m.date}</span>
                  <span className="text-white font-bold">{m.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

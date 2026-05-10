import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Target, 
  ChevronRight, MapPin, Radar, Users, Star 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Progress } from '../ui/progress';

const Scouting: React.FC = () => {
  const { userClubId, clubs, staff, players, assignScout, skipWeeks, currentSeason } = useGameStore();
  const [shortlist, setShortlist] = useState<string[]>([]);

  const club = clubs.find(c => c.id === userClubId);
  const scouts = (staff || []).filter(s => s.clubId === userClubId && s.role === 'SCOUT');
  
  if (!club) return null;

  const regions = ['Europe', 'South America', 'Africa', 'Asia', 'North America'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Scouting Network</h1>
          <p className="text-zinc-500 font-medium">Global intelligence network for identifying world-class talent.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => skipWeeks(4)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-[10px] uppercase tracking-widest px-6 h-12 rounded-xl border border-white/5"
          >
            SKIP 1 MONTH
          </Button>
          <Badge className="bg-indigo-600 text-white px-4 py-2 font-black uppercase text-[10px] tracking-widest border-none">
            SEASON {currentSeason}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Network Status */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Regional Assignments</h2>
          {scouts.length === 0 ? (
            <Card className="bg-zinc-950 border-white/5 border-dashed p-12 text-center space-y-4">
              <Radar className="w-12 h-12 text-zinc-800 mx-auto" />
              <p className="text-zinc-500 font-medium italic">No scouts currently employed. Hire scouts in the Backroom Staff screen to start discovery.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {scouts.map(scout => {
                const assignment = club.scoutAssignments?.find(a => a.scoutId === scout.id);
                return (
                  <Card key={scout.id} className="bg-zinc-900 border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-indigo-400 border border-white/5 font-black text-xl">
                          {scout.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white tracking-tight">{scout.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-zinc-500" />
                              <span className="text-xs font-bold text-zinc-400">{assignment?.region || 'UNASSIGNED'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-zinc-500" />
                              <span className="text-xs font-bold text-indigo-400">{assignment?.playersFound.length || 0} Found</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        {assignment ? (
                          <div className="w-48 space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                              <span>Discovery Progress</span>
                              <span className="text-white">{assignment.progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={assignment.progress} className="h-1.5" />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {regions.map(r => (
                              <Button 
                                key={r}
                                onClick={() => assignScout(club.id, scout.id, r)}
                                variant="outline" 
                                className="text-[9px] font-black h-8 px-3 border-white/5 hover:bg-indigo-600 hover:text-white transition-all uppercase"
                              >
                                {r.split(' ')[0]}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Discovered Players */}
          <div className="pt-8">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Discovered Talent Pool</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.scoutAssignments?.flatMap(a => a.playersFound).map(pid => {
                const player = players.find(p => p.id === pid);
                if (!player) return null;
                return (
                  <div key={pid} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between group hover:bg-zinc-800 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-zinc-700">
                        {player.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{player.firstName} {player.lastName}</h4>
                        <div className="flex gap-2 mt-0.5">
                          <Badge className="bg-white/5 text-[8px] h-4 px-1.5 text-zinc-500 font-black">{player.position}</Badge>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase">{player.age} YRS</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShortlist(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]);
                        }}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg border",
                          shortlist.includes(pid) ? "bg-amber-500 border-amber-400 text-black" : "bg-white/5 border-white/10 text-zinc-500"
                        )}
                      >
                        <Star className="w-3 h-3" fill={shortlist.includes(pid) ? "currentColor" : "none"} />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
              {(!club.scoutAssignments || club.scoutAssignments.length === 0 || club.scoutAssignments.every(a => a.playersFound.length === 0)) && (
                <div className="col-span-full py-12 text-center text-zinc-700 font-bold uppercase tracking-widest text-[10px] italic">
                  No players discovered yet. Assignments must reach 100% progress.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scout Reports Info */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Intelligence Briefing</h2>
          <Card className="bg-indigo-600/5 border border-indigo-600/10 p-6 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Target className="w-6 h-6 text-indigo-400" />
              <h3 className="font-black text-white uppercase tracking-tighter italic">Strategic Focus</h3>
            </div>
            <p className="text-sm text-indigo-200/60 font-medium leading-relaxed mb-6">
              Scouts deployed to regions will identify players over time. Higher rated scouts discover hidden wonderkids and provide more accurate potential ratings.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold">Network Reach</span>
                <span className="text-white font-black">{((scouts.length / 5) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(scouts.length / 5) * 100}%` }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scouting;

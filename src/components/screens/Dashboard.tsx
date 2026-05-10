import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Trophy, Users, DollarSign, Activity, ChevronRight, MessageSquare, Newspaper, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { userClubId, clubs, managers, players, matches, news } = useGameStore();

  const club = clubs.find(c => c.id === userClubId);
  if (!club) return null;

  const manager = managers.find(m => m.clubId === userClubId);
  const squadSize = players.filter(p => p.clubId === userClubId).length;
  const lastMatch = [...(matches || [])].reverse().find(m => m.homeClubId === userClubId || m.awayClubId === userClubId);
  
  // Get latest 3 news stories
  const recentNews = (news || []).slice(0, 3);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Fan Confidence', value: club.fanConfidence, icon: Users, color: 'text-sky-400' },
          { label: 'Board Confidence', value: club.boardConfidence, icon: Trophy, color: 'text-indigo-400' },
          { label: 'Squad Morale', value: manager?.morale || 70, icon: Activity, color: 'text-emerald-400' },
          { label: 'Transfer Budget', value: `£${((club.finances.balance || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-amber-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-zinc-900 border-white/5 hover:border-indigo-500/30 transition-all shadow-xl group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}{typeof stat.value === 'number' ? '%' : ''}</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight mt-1">{stat.label}</p>
              </div>
              {typeof stat.value === 'number' && (
                <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div className={cn("h-full bg-current transition-all duration-1000", stat.color)} style={{ width: `${stat.value}%` }} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Recent Activity & Manager */}
        <div className="lg:col-span-2 space-y-8">
          {/* Manager Insight */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl font-black text-indigo-500 border border-white/10 shadow-inner">
                    {manager?.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">{manager?.name}</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded inline-block">
                      {manager?.philosophy.replace('_', ' ')} Specialist
                    </p>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Trust</span>
                        <span className="text-lg font-black text-white">{manager?.relationshipWithChairman}%</span>
                      </div>
                      <div className="w-px h-8 bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Squad Size</span>
                        <span className="text-lg font-black text-white">{squadSize} Players</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border",
                    (manager?.relationshipWithChairman || 0) > 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {(manager?.relationshipWithChairman || 0) > 70 ? 'Stable' : 'Unsettled'}
                  </Badge>
                  <Button 
                    onClick={() => setActiveTab('squad')}
                    variant="ghost" 
                    className="text-[10px] text-indigo-400 font-black flex items-center gap-2 hover:text-indigo-300 hover:bg-indigo-400/5 h-10 px-4 rounded-xl uppercase tracking-widest"
                  >
                    Squad Feedback <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Match */}
          <Card className="bg-zinc-900 border-white/5 shadow-xl">
            <CardHeader className="p-8 pb-4 border-b border-white/5">
              <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center justify-between">
                LAST MATCH PERFORMANCE
                <button onClick={() => setActiveTab('news')} className="text-indigo-400 hover:text-indigo-300 transition-colors uppercase">All Results</button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {lastMatch ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5 font-black text-zinc-700">
                      {clubs.find(c => c.id === lastMatch.homeClubId)?.name.charAt(0)}
                    </div>
                    <span className="text-lg font-black text-white tracking-tight">{clubs.find(c => c.id === lastMatch.homeClubId)?.name}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-10">
                    <div className="flex items-center gap-6 px-8 py-3 bg-zinc-950 rounded-[2rem] border border-white/5 shadow-inner">
                      <span className="text-4xl font-black text-white">{lastMatch.homeScore}</span>
                      <span className="text-zinc-700 font-black text-xl">:</span>
                      <span className="text-4xl font-black text-white">{lastMatch.awayScore}</span>
                    </div>
                    <Badge variant="outline" className="border-white/5 text-[8px] font-black uppercase text-zinc-500 tracking-widest">Full Time</Badge>
                  </div>
                  <div className="flex items-center gap-6 flex-1 justify-end">
                    <span className="text-lg font-black text-white text-right tracking-tight">{clubs.find(c => c.id === lastMatch.awayClubId)?.name}</span>
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5 font-black text-zinc-700">
                      {clubs.find(c => c.id === lastMatch.awayClubId)?.name.charAt(0)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-sm text-zinc-600 font-black uppercase tracking-widest italic">No match data recorded this season.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real News Feed */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">INSIDER BRIEFING</h4>
            {recentNews.length > 0 ? (
              recentNews.map((story) => (
                <div 
                  key={story.id} 
                  onClick={() => setActiveTab('news')}
                  className="group p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-indigo-400">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">{story.category}</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{story.date}</span>
                      </div>
                      <p className="text-sm text-zinc-200 font-black tracking-tight group-hover:text-white transition-colors">{story.title}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest py-8 text-center border border-white/5 border-dashed rounded-2xl italic">Awaiting global developments...</p>
            )}
          </div>
        </div>

        {/* Sidebar: Financials & Tasks */}
        <div className="space-y-8">
          <Card className="bg-zinc-900 border-white/5 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Financial Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Weekly Wages</p>
                  <p className="text-xl font-black text-white tracking-tighter">£{((club.finances.weeklyWages || 0) / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Infrastructure</p>
                  <p className="text-xl font-black text-white tracking-tighter">£{((club.finances.expenses.facilityMaintenance || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Proj. Net</p>
                  <p className="text-lg font-black text-emerald-400">+£124K</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-500">
                  SECURE
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('finances')}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl uppercase text-[10px] tracking-[0.2em] transition-all border border-white/5"
              >
                Detailed Ledger
              </Button>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">URGENT DIRECTIVES</h4>
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4 group hover:bg-amber-500/10 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white tracking-tight">Manager Request</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">The manager has requested a meeting regarding the transfer budget.</p>
                <Button 
                  onClick={() => setActiveTab('manager')}
                  variant="ghost" 
                  className="mt-4 p-0 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 hover:bg-transparent h-auto"
                >
                  Review Directive <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { type Player, type Club } from '../../types/game';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Zap, Heart, Brain, Lock, History, Trophy,
  Activity, UserMinus, Star, 
  ShieldCheck, Target, ChevronRight, DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface PlayerModalProps {
  player: Player | null;
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTransferList: (playerId: string) => void;
  onToggleLoanList?: (playerId: string) => void;
  isUserPlayer?: boolean;
  onMakeBid?: (playerId: string) => void;
  onReleasePlayer?: (playerId: string) => void;
  onRetrainPlayer?: (playerId: string, position: string) => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ 
  player, 
  club, 
  isOpen, 
  onClose, 
  onToggleTransferList,
  onToggleLoanList,
  isUserPlayer = false,
  onMakeBid,
  onReleasePlayer,
  onRetrainPlayer
}) => {
  if (!player) return null;

  const renderStat = (label: string, value: number, max = 100) => (
    <div className="group/stat">
      <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 group-hover/stat:text-zinc-300 transition-colors">
        <span>{label}</span>
        <span className={cn(
          "font-mono",
          value > 85 ? "text-emerald-400" : value > 70 ? "text-sky-400" : value > 50 ? "text-zinc-300" : "text-rose-400"
        )}>{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            value > 85 ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" : 
            value > 70 ? "bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]" : 
            "bg-zinc-700"
          )}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#09090b] border-white/5 text-white p-0 overflow-hidden shadow-2xl shadow-black">
        <DialogHeader className="sr-only">
          <DialogTitle>{player.firstName} {player.lastName} - Player Profile</DialogTitle>
          <DialogDescription>
            Detailed statistics, happiness levels, and career history for {player.firstName} {player.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[650px]">
          {/* Left Sidebar - Profile Summary */}
          <div className="w-80 bg-zinc-950 border-r border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-zinc-900 border-2 border-white/10 flex items-center justify-center text-5xl font-black text-zinc-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {player.lastName.charAt(0)}
                  {player.isLegend && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-xl shadow-lg">
                      <Star className="w-4 h-4 text-black fill-black" />
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">{player.firstName}</h2>
                <h3 className="text-3xl font-black tracking-tighter text-indigo-400 uppercase leading-none">{player.lastName}</h3>
                
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                    {player.position}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-zinc-400 px-3 py-1 font-bold text-[10px] uppercase">
                    {player.age} YRS
                  </Badge>
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Market Value</span>
                  <span className="text-xl font-black text-emerald-400">£{(player.value / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weekly Wage</span>
                  <span className="text-lg font-black text-white">£{player.wage.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              {isUserPlayer ? (
                <>
                  <Button 
                    onClick={() => onToggleTransferList(player.id)}
                    className={cn(
                      "w-full font-black text-[10px] uppercase tracking-widest h-12 rounded-xl transition-all",
                      player.isTransferListed 
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20" 
                        : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10"
                    )}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    {player.isTransferListed ? 'Remove from Transfer List' : 'List for Transfer'}
                  </Button>
                  {onToggleLoanList && (
                    <Button 
                      onClick={() => onToggleLoanList(player.id)}
                      className={cn(
                        "w-full font-black text-[10px] uppercase tracking-widest h-12 rounded-xl transition-all",
                        player.isLoanListed 
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                          : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10"
                      )}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      {player.isLoanListed ? 'Remove from Loan List' : 'List for Loan'}
                    </Button>
                  )}
                  {onReleasePlayer && (
                    <Button 
                      onClick={() => onReleasePlayer(player.id)}
                      className="w-full font-black text-[10px] uppercase tracking-widest h-12 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/20 text-rose-500 hover:text-white transition-all"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Release from Club
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  onClick={() => onMakeBid?.(player.id)}
                  className="w-full font-black text-[10px] uppercase tracking-widest h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Make Transfer Bid
                </Button>
              )}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col bg-[#09090b]">
            <Tabs defaultValue="attributes" className="flex-1 flex flex-col">
              <div className="px-8 pt-8 flex items-center justify-between">
                <TabsList className="bg-zinc-950/50 p-1 border border-white/5 rounded-2xl">
                  <TabsTrigger value="attributes" className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Performance</TabsTrigger>
                  <TabsTrigger value="happiness" className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Social</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">History</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 px-3 py-1.5">
                    <Activity className="w-3 h-3" /> {player.fitness}%
                  </Badge>
                  {isUserPlayer && onRetrainPlayer && (
                    <div className="flex gap-1 ml-4">
                      {(['GK', 'DEF', 'MID', 'ATT'] as const).map(pos => (
                        <Button
                          key={pos}
                          onClick={() => onRetrainPlayer(player.id, pos)}
                          variant="outline"
                          className={cn(
                            "h-7 px-2 text-[8px] font-black uppercase tracking-widest border-white/10",
                            player.position === pos ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 text-zinc-500 hover:text-white"
                          )}
                        >
                          {pos}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <TabsContent value="attributes" className="mt-0 space-y-12">
                  <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Target className="w-4 h-4" /> Technical Proficiency
                      </h4>
                      <div className="space-y-5">
                        {player.position === 'GK' ? (
                          <>
                            {renderStat('Handling', player.technical.handling || 50)}
                            {renderStat('Reflexes', player.technical.reflexes || 50)}
                            {renderStat('Area Command', player.technical.commandOfArea || 50)}
                            {renderStat('Eccentricity', player.technical.eccentricity || 50)}
                            {renderStat('Rushing Out', player.technical.rushingOut || 50)}
                          </>
                        ) : (
                          <>
                            {renderStat('Passing', player.technical.passing)}
                            {renderStat('Shooting', player.technical.shooting)}
                            {renderStat('Dribbling', player.technical.dribbling)}
                            {renderStat('Tackling', player.technical.tackling)}
                            {renderStat('Vision', player.technical.vision)}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Physical Engine
                      </h4>
                      <div className="space-y-5">
                        {renderStat('Pace', player.physical.pace)}
                        {renderStat('Strength', player.physical.strength)}
                        {renderStat('Stamina', player.physical.stamina)}
                        {renderStat('Agility', player.physical.agility)}
                        {renderStat('Acceleration', player.physical.acceleration)}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Mental Resilience
                      </h4>
                      <div className="space-y-5">
                        {renderStat('Leadership', player.mental.leadership)}
                        {renderStat('Composure', player.mental.composure)}
                        {renderStat('Work Rate', player.mental.workRate)}
                        {renderStat('Decisions', player.mental.decisions)}
                        {renderStat('Determination', player.mental.determination)}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Tactical Intelligence
                      </h4>
                      <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-amber-500" strokeDasharray={226} strokeDashoffset={226 - (226 * player.tacticalFamiliarity) / 100} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-lg">{Number(player.tacticalFamiliarity).toFixed(2)}%</div>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter leading-tight">Tactical Familiarity<br/>with current system</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="happiness" className="mt-0 space-y-8">
                  <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                      <Heart className={cn("w-8 h-8", player.morale > 70 ? "text-emerald-400" : "text-rose-400")} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white">Emotional State: {player.morale > 70 ? 'Ecstatic' : player.morale > 40 ? 'Content' : 'Distressed'}</h4>
                      <p className="text-sm text-zinc-500">Overall morale influenced by club performance and personal life.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(player.happiness).map(([key, val]) => (
                      <div key={key} className="p-6 rounded-3xl bg-zinc-950 border border-white/5 space-y-4 hover:border-indigo-500/30 transition-colors group">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{key.replace(/([A-Z])/g, ' $1')}</h5>
                          <span className="text-xs font-black text-white">{val}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000",
                              val > 80 ? "bg-emerald-500" : val > 40 ? "bg-amber-500" : "bg-rose-500"
                            )} 
                            style={{ width: `${val}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-500" /> Psychological Profile
                    </h4>
                    <div className="grid grid-cols-3 gap-8 pt-4">
                      {['Professionalism', 'Ambition', 'Loyalty'].map((trait) => (
                        <div key={trait} className="space-y-2 text-center">
                          <div className="text-lg font-black text-white">{(player.personality as any)[trait.toLowerCase()] || 70}/100</div>
                          <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{trait}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10 text-center space-y-2">
                      <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-white">{player.history.trophies || 0}</div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Major Trophies</div>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10 text-center space-y-2">
                      <History className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-white">{player.history.appearances || 0}</div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Apps</div>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 text-center space-y-2">
                      <Zap className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <div className="text-4xl font-black text-white">{player.history.goals || 0}</div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Goals Scored</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Career Milestones</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-zinc-500">24</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Joined {club?.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase font-black">Official Transfer • Season {player.history.joinedSeason} Week {player.history.joinedWeek}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-800" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerModal;

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import {
  History, Crown, Target, DollarSign,
  Briefcase, Handshake, ShieldCheck, Dumbbell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SeasonTarget, Formation, TrainingFocus } from '../../types/game';

const BoardRoom: React.FC = () => {
  const { userClubId, clubs, managers, setSeasonTarget, setTransferBudget, acceptSponsor, renameClub, setFormation, setTactics, setTrainingFocus } = useGameStore();
  const [newClubName, setNewClubName] = useState('');
  const club = clubs.find(c => c.id === userClubId);
  const manager = managers.find(m => m.clubId === userClubId);
  const [tempBudget, setTempBudget] = useState(club?.transferBudget || 0);

  if (!club) return null;

  const board = club.board;

  const targets: SeasonTarget[] = ['CHAMPIONS', 'PROMOTION', 'PLAYOFFS', 'TOP_HALF', 'MID_TABLE', 'AVOID_RELEGATION'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Chairman's Office</h1>
          <p className="text-zinc-500 font-medium">Strategic directives and commercial partnerships.</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-zinc-800 text-zinc-400 px-4 py-2 border-none font-black uppercase text-[10px] tracking-widest">
            {(board.type || '').replace('_', ' ')} OWNERSHIP
          </Badge>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase">£{(club.finances.balance / 1000000).toFixed(1)}M BALANCE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Strategic Planning */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900 border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" /> Strategic Directives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              {/* Season Target */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500 font-bold">PHILOSOPHY</span>
                    <span className="text-white font-black">{manager?.preferredStyle?.replace('_', ' ') || 'NONE'}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500 font-bold">FORMATION</span>
                    <span className="text-white font-black">{manager?.preferredFormation || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Season Objective</h3>
                  <Badge className="bg-indigo-600 text-white font-black text-[10px] px-3 py-1 uppercase">{club.seasonTarget.replace('_', ' ')}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {targets.map(target => (
                    <button
                      key={target}
                      onClick={() => setSeasonTarget(club.id, target)}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all",
                        club.seasonTarget === target
                          ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20"
                          : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {target.replace('_', ' ')}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                  * Changing objectives mid-season significantly impacts board confidence if targets are lowered.
                </p>
              </div>

              {/* Formation Setting */}
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Tactical Formation</h3>
                  <Badge className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1 uppercase">{club.formation}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-4-1', '4-4-2_DIAMOND'] as Formation[]).map(formation => (
                    <button
                      key={formation}
                      onClick={() => setFormation(club.id, formation)}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all",
                        club.formation === formation
                          ? "bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-600/20"
                          : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {formation.replace('_', ' ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tactical Philosophy */}
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Tactical Approach</h3>
                  <Badge className="bg-sky-600 text-white font-black text-[10px] px-3 py-1 uppercase">{club.tactics?.replace('_', ' ')}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['POSSESSION', 'HIGH_PRESSING', 'COUNTER_ATTACK', 'DEFENSIVE', 'WING_PLAY', 'DIRECT'] as any[]).map(tactic => (
                    <button
                      key={tactic}
                      onClick={() => setTactics(club.id, tactic)}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all",
                        club.tactics === tactic
                          ? "bg-sky-600 border-sky-500 shadow-lg shadow-sky-600/20"
                          : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {tactic.replace('_', ' ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Focus */}
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Training Focus</h3>
                  <Badge className="bg-rose-600 text-white font-black text-[10px] px-3 py-1 uppercase">{club.trainingFocus}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['ATTACKING', 'DEFENSIVE', 'PHYSICAL', 'MENTAL', 'BALANCED'] as TrainingFocus[]).map(focus => (
                    <button
                      key={focus}
                      onClick={() => setTrainingFocus(club.id, focus)}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all",
                        club.trainingFocus === focus
                          ? "bg-rose-600 border-rose-500 shadow-lg shadow-rose-600/20"
                          : "bg-white/5 border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {focus}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transfer Budget */}
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Transfer Warchest</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Allocated funds for squad recruitment</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-400 italic">£{(club.transferBudget / 1000000).toFixed(1)}M</p>
                </div>

                <div className="space-y-4">
                  <Slider
                    value={[tempBudget]}
                    max={Math.max(1, club.finances.balance)}
                    min={0}
                    step={Math.max(10000, Math.floor(club.finances.balance / 100))}
                    onValueChange={(val) => setTempBudget(val[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase">
                    <span>£0</span>
                    <span>Max: £{(club.finances.balance / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${club.finances.balance > 0 ? (tempBudget / club.finances.balance) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 font-bold text-center">
                    {club.finances.balance > 0
                      ? `${((tempBudget / club.finances.balance) * 100).toFixed(0)}% of balance allocated`
                      : 'No funds available'}
                  </p>
                </div>

                <Button
                  onClick={() => setTransferBudget(club.id, tempBudget)}
                  disabled={tempBudget === club.transferBudget}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-2xl uppercase tracking-widest text-[10px]"
                >
                  Confirm Budget Allocation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Club Rebranding */}
          <Card className="bg-zinc-900 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Club Rebranding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="New Club Name..."
                  className="bg-zinc-800 border-white/5 text-white text-xs h-10 rounded-lg"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (newClubName.trim()) {
                      renameClub(club.id, newClubName);
                      setNewClubName('');
                    }
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-lg border border-white/5"
                >
                  CONFIRM NAME CHANGE
                </Button>
              </div>
              <p className="text-[10px] text-zinc-600 italic">Changing the club name may affect fan sentiment briefly.</p>
            </CardContent>
          </Card>

          {/* History / Timeline */}
          <Card className="bg-zinc-900 border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" /> Board Archives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {club.history.slice(-5).reverse().map((entry, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-[10px] font-black text-zinc-700 border border-white/5 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed">{entry}</p>
                      <div className="h-px w-full bg-white/5 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Commercial Office & Sponsors */}
        <div className="space-y-8">
          <Card className="bg-zinc-900 border-white/5">
            <CardHeader className="border-b border-white/5 bg-emerald-500/[0.02]">
              <CardTitle className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Handshake className="w-4 h-4" /> Commercial Office
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center py-4">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active Partnerships</p>
                <p className="text-2xl font-black text-white">{club.activeSponsors?.length || 0} / 3</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Proposed Deals</h4>
                {club.availableSponsors?.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <Briefcase className="w-8 h-8 text-zinc-900 mx-auto mb-2" />
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No new proposals</p>
                  </div>
                ) : (
                  club.availableSponsors?.map(sponsor => (
                    <Card key={sponsor.id} className="bg-zinc-950 border-white/5 group hover:border-emerald-500/30 transition-all">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-black text-white text-sm tracking-tight">{sponsor.name}</h5>
                            <Badge className="bg-white/5 text-zinc-500 text-[8px] font-black uppercase mt-1 px-1.5">{sponsor.type} PARTNER</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-400">£{(sponsor.amount / 1000).toFixed(1)}K</p>
                            <p className="text-[8px] font-black text-zinc-600 uppercase">{sponsor.duration} SEASONS</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-zinc-600" />
                            <span className="text-[8px] font-black text-zinc-600 uppercase">Req. Rep: {sponsor.reputationRequired}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => acceptSponsor(club.id, sponsor.id)}
                            disabled={club.reputation < sponsor.reputationRequired}
                            className={cn(
                              "h-8 font-black text-[9px] uppercase tracking-widest rounded-lg px-4 transition-all",
                              club.reputation < sponsor.reputationRequired
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            )}
                          >
                            {club.reputation < sponsor.reputationRequired ? 'REP TOO LOW' : 'SIGN DEAL'}
                          </Button>

                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Board Confidence Card (Refined) */}
          <Card className="bg-indigo-600 border-none shadow-2xl shadow-indigo-600/20 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="w-24 h-24 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Chairman's Status</p>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">{club.boardConfidence}%</h3>
                <p className="text-xs font-bold text-indigo-200 mt-1 uppercase">
                  {club.boardConfidence > 70 ? 'Absolute Authority' : club.boardConfidence > 40 ? 'Under Observation' : 'Vote of No Confidence'}
                </p>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40" style={{ width: `${club.boardConfidence}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BoardRoom;
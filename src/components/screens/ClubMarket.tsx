import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Search, Landmark, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ClubDetailsModal: React.FC<{
  club: any;
  league?: any;
  manager?: any;
  players: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ club, league, manager, players, open, onOpenChange }) => {
  const topPlayers = [...players].sort((a, b) => b.overallRating - a.overallRating).slice(0, 5);
  const averageRating = players.length ? (players.reduce((sum, player) => sum + player.overallRating, 0) / players.length).toFixed(1) : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c0c0e] border-white/5 text-white max-w-4xl p-8 rounded-[2rem] shadow-2xl shadow-black">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">{club.name}</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium mt-2">{league?.name} • Rep {club.reputation.toFixed(1)}</DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Formation</span>
              <span className="text-sm font-black text-white uppercase tracking-[0.3em]">{club.formation.replace('_', ' ')}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mt-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Club Status</p>
                <p className="text-sm text-white font-black">{club.isForSale ? 'For Sale' : 'Private'} • {club.culture.join(', ')}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Board Ambition</p>
                <p className="text-sm text-white font-black">{club.board.expectations.replace('_', ' ')}</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Confidence</p>
                <p className="text-sm text-white font-black">Fans {club.fanConfidence}% • Board {club.board.confidence}%</p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Valuation</p>
                <p className="text-sm text-emerald-400 font-black">£{(club.valuation / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Financial Snapshot</p>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <p>Balance: £{(club.finances.balance / 1000000).toFixed(1)}M</p>
                  <p>Transfer Budget: £{(club.finances.transferBudget / 1000000).toFixed(1)}M</p>
                  <p>Weekly Wages: £{(club.finances.weeklyWages / 1000).toFixed(1)}k</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Facilities</p>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <p>{club.facilities.stadium.name} • {Math.floor(club.facilities.stadium.capacity / 1000)}k cap</p>
                  <p>{club.facilities.trainingGround.name} L{club.facilities.trainingGround.level}</p>
                  <p>{club.facilities.medicalCenter.name} L{club.facilities.medicalCenter.level}</p>
                  <p>{club.facilities.youthAcademy.name} L{club.facilities.youthAcademy.level}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Manager</p>
              {manager ? (
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <p className="text-white font-black">{manager.name} • {manager.archetype.replace('_', ' ')}</p>
                  <p>Style: {manager.preferredStyle}</p>
                  <p>Salary: £{(manager.salary / 1000).toFixed(0)}k/wk</p>
                  <p>Contract: {manager.contractWeeksRemaining}w</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-400">No manager data available</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Squad Snapshot</p>
                <p className="text-[10px] uppercase tracking-widest text-white">Avg {averageRating}</p>
              </div>
              <div className="space-y-3">
                {topPlayers.length > 0 ? topPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-white">{player.firstName} {player.lastName}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{player.position} • {player.overallRating}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400">£{(player.value / 1000000).toFixed(1)}M</span>
                  </div>
                )) : (
                  <p className="text-sm text-zinc-400">No players tracked for this club.</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Rivals</p>
              <div className="flex flex-wrap gap-2">
                {club.rivals.length > 0 ? club.rivals.map(rival => (
                  <span key={rival} className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-widest text-zinc-300">{rival}</span>
                )) : <span className="text-sm text-zinc-400">No rivals listed</span>}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-white text-black hover:bg-zinc-200 px-8 h-14 rounded-2xl uppercase tracking-widest text-xs font-black">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ClubMarket: React.FC = () => {
  const { clubs, leagues, buyClub, personalBalance, players, managers } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | 'all'>('all');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  const selectedClub = selectedClubId ? clubs.find(club => club.id === selectedClubId) : null;
  const selectedLeagueData = selectedClub ? leagues.find(l => l.id === selectedClub.leagueId) : undefined;
  const selectedManager = selectedClub ? managers.find(manager => manager.clubId === selectedClub.id) : undefined;
  const selectedClubPlayers = selectedClub ? players.filter(player => player.clubId === selectedClub.id) : [];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === 'all' || club.leagueId === selectedLeague;
    return matchesSearch && matchesLeague && !club.isUserControlled;
  }).sort((a, b) => a.valuation - b.valuation);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Acquisition Market</h1>
          <p className="text-zinc-500 font-medium">Browse available football franchises for purchase.</p>
        </div>
        
        <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-600/20 px-6 py-4 flex items-center gap-4 text-white">
          <Wallet className="w-6 h-6 text-indigo-200" />
          <div>
            <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">Personal Wealth</p>
            <p className="text-2xl font-black tracking-tighter italic">£{(personalBalance / 1000000).toFixed(1)}M</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search clubs by name..." 
            className="bg-zinc-900 border-white/5 pl-11 h-12 text-white placeholder:text-zinc-600 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {leagues.map(league => (
            <Button
              key={league.id}
              variant={selectedLeague === league.id ? 'default' : 'outline'}
              onClick={() => setSelectedLeague(league.id === selectedLeague ? 'all' : league.id)}
              className={cn(
                "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-white/5",
                selectedLeague === league.id ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
              )}
            >
              {league.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map(club => {
          const league = leagues.find(l => l.id === club.leagueId);
          const canAfford = personalBalance >= club.valuation;

          return (
            <Card key={club.id} className="bg-zinc-900 border-white/5 group hover:border-indigo-500/30 transition-all overflow-hidden">
              <div 
                className="h-2 w-full" 
                style={{ background: `linear-gradient(90deg, ${club.primaryColor}, ${club.secondaryColor})` }} 
              />
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{club.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{league?.name}</p>
                  </div>
                  <Badge className="bg-white/5 text-zinc-400 border-none px-2 py-1 text-[8px] font-black uppercase">
                    Rep: {club.reputation.toFixed(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Stadium</p>
                    <p className="text-xs font-bold text-zinc-300 truncate">{club.stadiumName}</p>
                    <p className="text-[10px] text-zinc-500">{(club.facilities.stadium.capacity / 1000).toFixed(1)}k Cap</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Finance</p>
                    <p className="text-xs font-bold text-emerald-400">£{(club.finances.balance / 1000000).toFixed(1)}M</p>
                    <p className="text-[10px] text-zinc-500 italic">Balance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Market Value</p>
                    <p className="text-2xl font-black text-white italic">£{(club.valuation / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      onClick={() => setSelectedClubId(club.id)}
                      variant="outline"
                      className="h-12 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      View Details
                    </Button>
                    <Button 
                      disabled={!canAfford}
                      onClick={() => buyClub(club.id)}
                      className={cn(
                        "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                        canAfford 
                          ? "bg-white text-black hover:bg-zinc-200" 
                          : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      {canAfford ? 'ACQUIRE CLUB' : 'INSUFFICIENT FUNDS'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedClub && (
        <ClubDetailsModal
          club={selectedClub}
          league={selectedLeagueData}
          manager={selectedManager}
          players={selectedClubPlayers}
          open={!!selectedClub}
          onOpenChange={(open) => !open && setSelectedClubId(null)}
        />
      )}

      {filteredClubs.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
          <Landmark className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
          <h3 className="text-xl font-black text-zinc-500 uppercase">No Clubs Available</h3>
          <p className="text-sm text-zinc-600 font-medium">Try adjusting your filters or wait for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default ClubMarket;

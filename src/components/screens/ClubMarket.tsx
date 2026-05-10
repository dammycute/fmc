import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Building2, Users, Trophy, History, TrendingUp, 
  TrendingDown, Crown, Target, Zap, DollarSign,
  Briefcase, Handshake, ShieldCheck, ChevronRight,
  Search, Filter, Landmark, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ClubMarket: React.FC = () => {
  const { clubs, leagues, buyClub, personalBalance } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | 'all'>('all');

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
            <p className="text-2xl font-black tracking-tighter italic">£{(personalBalance / 1000000).toFixed(2)}M</p>
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
                    Rep: {club.reputation.toFixed(0)}
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

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Market Value</p>
                    <p className="text-2xl font-black text-white italic">£{(club.valuation / 1000000).toFixed(2)}M</p>
                  </div>
                  <Button 
                    disabled={!canAfford}
                    onClick={() => buyClub(club.id)}
                    className={cn(
                      "px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      canAfford 
                        ? "bg-white text-black hover:bg-zinc-200" 
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    )}
                  >
                    {canAfford ? 'ACQUIRE CLUB' : 'INSUFFICIENT FUNDS'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

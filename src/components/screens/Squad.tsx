import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Search, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Input } from '../ui/input';
import PlayerModal from '../ui/PlayerModal';

const Squad: React.FC = () => {
  const { userClubId, clubs, players, toggleTransferList, toggleLoanList, releasePlayer, retrainPlayer } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const userClub = clubs.find(c => c.id === userClubId);
  const squad = players.filter(p => p.clubId === userClubId);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || null;

  const filteredSquad = squad.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-amber-400';
    if (rating >= 75) return 'text-emerald-400';
    if (rating >= 65) return 'text-sky-400';
    return 'text-zinc-400';
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">First Team Squad</h1>
          <p className="text-zinc-500 font-medium text-sm mt-1">Manage player contracts and monitor tactical compatibility.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search players..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/[0.02] border-white/5 text-sm h-10 rounded-xl" 
            />
          </div>
          <button className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-500 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 glass-card overflow-hidden animate-fade-in-up">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase py-4">Player</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Pos</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Rating</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Apps</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Goals</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Form</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Fatigue</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase text-center">Happiness</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Morale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSquad.map((player) => (
              <TableRow 
                key={player.id} 
                onClick={() => setSelectedPlayerId(player.id)}
                className="border-white/5 hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 border border-white/5 group-hover:border-indigo-500/50 transition-colors">
                      {player.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{player.firstName} {player.lastName}</p>
                        {player.isTransferListed && <Badge className="h-3 px-1 text-[8px] bg-rose-500 text-white font-black">TL</Badge>}
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[8px] h-4 px-1 font-black uppercase border-none bg-transparent",
                        player.personality === 'WONDERKID' ? "text-amber-400" : 
                        player.personality === 'LEADER' ? "text-sky-400" :
                        player.personality === 'CLUB_HERO' ? "text-emerald-400" : "text-zinc-500"
                      )}>
                        {(player.personality || '').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-black border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    {player.position}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className={cn("text-sm font-black", getRatingColor(player.overallRating))}>
                      {(player.overallRating || 0).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold">POT: {player.potentialRating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-black text-zinc-300">{player.history?.appearances || 0}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-black text-zinc-300">{player.history?.goals || 0}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {(player.form || [7, 7, 7, 7, 7]).map((f, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1.5 h-3 rounded-sm",
                          f >= 7.5 ? "bg-emerald-500" : f >= 6.5 ? "bg-zinc-600" : "bg-rose-500"
                        )} 
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn("text-xs font-bold", (player.fatigue || 0) > 50 ? "text-orange-400" : "text-zinc-400")}>
                    {(player.fatigue || 0).toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {Object.entries(player.happiness || {}).map(([key, val]) => (
                      <div 
                        key={key}
                        className={cn(
                          "w-1 h-4 rounded-full",
                          val > 80 ? "bg-emerald-500" : val > 40 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        title={`${key}: ${val}%`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {player.morale > 75 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : player.morale > 40 ? <Minus className="w-4 h-4 text-zinc-600" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                    <span className="text-[10px] font-black text-zinc-500">{(player.morale || 0).toFixed(1)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PlayerModal 
        player={selectedPlayer}
        club={userClub || null}
        isOpen={!!selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
        onToggleTransferList={toggleTransferList}
        onToggleLoanList={toggleLoanList}
        isUserPlayer={true}
        onReleasePlayer={(id) => {
          releasePlayer(id);
          setSelectedPlayerId(null);
        }}
        onRetrainPlayer={retrainPlayer}
      />
    </div>
  );
};

export default Squad;

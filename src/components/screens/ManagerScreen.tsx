import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Trash2, Layout, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import TacticsBoard from '../ui/TacticsBoard';
import PlayerModal from '../ui/PlayerModal';

interface ManagerScreenProps {
  setActiveTab: (tab: string) => void;
}

const ManagerScreen: React.FC<ManagerScreenProps> = ({ setActiveTab }) => {
  const { userClubId, managers, clubs, players, transferRequests, respondToTransferRequest, sackManager, toggleTransferList } = useGameStore();
  const [viewMode, setViewMode] = useState<'board' | 'stats'>('board');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  const manager = managers.find(m => m.clubId === userClubId);
  const club = clubs.find(c => c.id === userClubId);
  const clubPlayers = players.filter(p => p.clubId === userClubId);
  const pendingRequests = transferRequests.filter(r => r.clubId === userClubId && r.status === 'PENDING');

  const handlePlayerClick = (player: any) => {
    setSelectedPlayer(player);
    setIsPlayerModalOpen(true);
  };

  if (!manager || !club) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
          <UserPlus className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Active Manager</h2>
        <p className="text-zinc-500 mt-2 max-w-sm">The club is currently without a manager. You need to hire someone to lead the team on the pitch.</p>
        <Button 
          onClick={() => setActiveTab('staff')}
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 font-bold"
        >
          HIRE NEW MANAGER
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Manager Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-48 h-48 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-6xl font-black text-indigo-500 overflow-hidden relative group">
          {manager.name.charAt(0)}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{manager.name}</h1>
              <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs mt-1">First Team Manager • Contracted for {manager.contractYears} Years</p>
            </div>
            <Button 
              variant="destructive" 
              className="font-bold gap-2"
              onClick={() => {
                if (window.confirm(`Are you sure you want to sack ${manager.name}? You will have to pay compensation.`)) {
                  sackManager(manager.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" /> SACK MANAGER
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[
              { label: 'Morale', value: manager.morale, color: 'text-emerald-400' },
              { label: 'Chairman Rel.', value: manager.relationshipWithChairman, color: 'text-sky-400' },
              { label: 'Discipline', value: manager.personality.discipline, color: 'text-amber-400' },
              { label: 'Loyalty', value: manager.personality.loyalty, color: 'text-rose-400' },
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{stat.label}</p>
                <p className={cn("text-xl font-black mt-1", stat.color)}>{(stat.value || 0).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layout className="w-4 h-4" /> CURRENT TACTICS & LINEUP
            </h3>
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
              <Button 
                size="sm" 
                variant="ghost" 
                className={cn("h-7 px-3 text-[9px] font-black uppercase tracking-widest", viewMode === 'board' ? "bg-white/10 text-white" : "text-zinc-500")}
                onClick={() => setViewMode('board')}
              >
                Board
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className={cn("h-7 px-3 text-[9px] font-black uppercase tracking-widest", viewMode === 'stats' ? "bg-white/10 text-white" : "text-zinc-500")}
                onClick={() => setViewMode('stats')}
              >
                Stats
              </Button>
            </div>
          </div>

          {viewMode === 'board' ? (
            <div className="max-w-2xl mx-auto w-full">
              <TacticsBoard 
                formation={club.formation}
                startingLineup={club.startingLineup || {}}
                players={clubPlayers}
                onPlayerClick={handlePlayerClick}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                  <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Team Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Attacking', value: manager.coaching.attacking },
                    { label: 'Defensive', value: manager.coaching.defensive },
                    { label: 'Possession', value: manager.coaching.tactical },
                    { label: 'Pressing', value: manager.pressing },
                  ].map((tactic, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <span>{tactic.label}</span>
                        <span>{(tactic.value || 0).toFixed(1)}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${tactic.value}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-white/5 p-6 flex flex-col justify-center items-center text-center space-y-4">
                <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Preferred Setup</h4>
                <div className="text-4xl font-black text-white">{club.formation}</div>
                <div className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest">{(club.tactics || '').replace('_', ' ')}</div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> PENDING REQUESTS ({pendingRequests.length})
          </h3>
          
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center text-zinc-600">
                <CheckCircle2 className="w-6 h-6 mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No pending requests</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="bg-white/[0.03] border-white/5 overflow-hidden group hover:bg-white/[0.05] transition-all">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-[7px] font-black tracking-tighter uppercase",
                        request.priority === 'EMERGENCY' ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"
                      )}>
                        {request.priority}
                      </Badge>
                      <h4 className="font-bold text-white text-xs">{(request.type || '').replace('_', ' ')}</h4>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed italic">"{request.message}"</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-500 text-[8px] font-black uppercase px-3" onClick={() => respondToTransferRequest(request.id, 'APPROVED')}>APPROVE</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 text-[8px] font-black uppercase px-3" onClick={() => respondToTransferRequest(request.id, 'REJECTED')}>REJECT</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <PlayerModal 
        player={selectedPlayer}
        club={club}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onToggleTransferList={toggleTransferList}
        isUserPlayer={true}
      />
    </div>
  );
};

export default ManagerScreen;


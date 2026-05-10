import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Clock, Trash2, Heart, ShieldAlert, Zap, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';

const ManagerScreen: React.FC = () => {
  const { userClubId, managers, transferRequests, respondToTransferRequest, sackManager } = useGameStore();

  const manager = managers.find(m => m.clubId === userClubId);
  const pendingRequests = transferRequests.filter(r => r.clubId === userClubId && r.status === 'PENDING');

  if (!manager) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
          <UserPlus className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Active Manager</h2>
        <p className="text-zinc-500 mt-2 max-w-sm">The club is currently without a manager. You need to hire someone to lead the team on the pitch.</p>
        <Button className="mt-6 bg-indigo-600 hover:bg-indigo-500 font-bold">HIRE NEW MANAGER</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Manager Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-48 h-48 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-6xl font-black text-indigo-500 overflow-hidden relative group">
          {manager.name.charAt(0)}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Change Image</span>
          </div>
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
                <p className={cn("text-xl font-black mt-1", stat.color)}>{(stat.value || 0).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Pending Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> PENDING REQUESTS ({pendingRequests.length})
          </h3>
          
          {pendingRequests.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center text-zinc-600">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">No pending transfer or infrastructure requests.</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="bg-white/[0.03] border-white/5 overflow-hidden group hover:bg-white/[0.05] transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        request.priority === 'EMERGENCY' ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"
                      )}>
                        {request.type === 'SQUAD_WEAKNESS' ? <ShieldAlert className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                          {request.type.replace('_', ' ')}
                          <Badge className={cn(
                            "text-[8px] font-black tracking-tighter",
                            request.priority === 'EMERGENCY' ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {request.priority}
                          </Badge>
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Requested Week {request.weekRequested}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">"{request.message}"</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 h-9"
                      onClick={() => respondToTransferRequest(request.id, 'APPROVED')}
                    >
                      <CheckCircle2 className="w-4 h-4" /> APPROVE
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-zinc-400 font-bold gap-2 h-9"
                      onClick={() => respondToTransferRequest(request.id, 'DELAYED')}
                    >
                      <Clock className="w-4 h-4" /> DELAY
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 font-bold gap-2 h-9"
                      onClick={() => respondToTransferRequest(request.id, 'REJECTED')}
                    >
                      <XCircle className="w-4 h-4" /> REJECT
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Col: Tactical Preferences */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> TACTICAL STYLE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 font-bold">PHILOSOPHY</span>
                  <span className="text-white font-black">{manager.philosophy.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 font-bold">FORMATION</span>
                  <span className="text-white font-black">{manager.preferredFormation}</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Attacking', value: manager.coaching.attacking },
                  { label: 'Defensive', value: manager.coaching.defensive },
                  { label: 'Possession', value: manager.coaching.tactical },
                  { label: 'Pressing', value: manager.pressing },
                ].map((tactic, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>{tactic.label}</span>
                      <span>{(tactic.value || 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${tactic.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerScreen;

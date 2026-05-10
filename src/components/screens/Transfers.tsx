import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ShoppingCart, ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const Transfers: React.FC = () => {
  const { userClubId, clubs, players, transferBids, respondToTransferBid, isTransferWindowOpen } = useGameStore();

  const userClubBids = transferBids.filter(b => b.toClubId === userClubId && b.status === 'PENDING');
  const userPurchases = transferBids.filter(b => b.fromClubId === userClubId);
  const otherBids = transferBids.filter(b => b.toClubId !== userClubId).slice(-5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Transfer Centre</h1>
          <p className="text-zinc-500 font-medium">Manage incoming bids and scout the global market.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn(
            "px-4 py-1.5 text-xs font-black tracking-widest",
            isTransferWindowOpen ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
          )}>
            WINDOW: {isTransferWindowOpen ? 'OPEN' : 'CLOSED'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Incoming Bids */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Incoming Bids ({userClubBids.length})
          </h3>

          {userClubBids.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center text-zinc-600">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-10" />
              <p className="text-sm font-medium">No active bids for your players.</p>
            </div>
          ) : (
            userClubBids.map((bid) => {
              const player = players.find(p => p.id === bid.playerId);
              const fromClub = clubs.find(c => c.id === bid.fromClubId);
              if (!player || !fromClub) return null;

              return (
                <Card key={bid.id} className="bg-white/[0.03] border-white/5 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-black text-indigo-500">
                          {player.lastName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{player.firstName} {player.lastName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 border-white/5 text-zinc-500">{player.position}</Badge>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Valuation: £{((player.value || 0)/1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Offered By</p>
                        <p className="text-sm font-bold text-white">{fromClub.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Transfer Fee</p>
                        <p className="text-2xl font-black text-emerald-400">£{((bid.amount || 0)/1000000).toFixed(1)}M</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Status</p>
                        <p className="text-sm font-bold text-amber-500">Awaiting Decision</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => respondToTransferBid(bid.id, 'ACCEPTED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> ACCEPT BID
                      </Button>
                      <Button 
                        onClick={() => respondToTransferBid(bid.id, 'REJECTED')}
                        variant="outline" 
                        className="flex-1 border-white/10 hover:bg-white/5 text-rose-500 font-bold gap-2"
                      >
                        <XCircle className="w-4 h-4" /> REJECT BID
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right: Market Activity */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-white/5">
            <CardHeader>
              <CardTitle className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> RECENT ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherBids.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">No recent market activity.</p>
              ) : (
                otherBids.map(bid => {
                  const player = players.find(p => p.id === bid.playerId);
                  const fromClub = clubs.find(c => c.id === bid.fromClubId);
                  const toClub = clubs.find(c => c.id === bid.toClubId);
                  if (!player || !fromClub || !toClub) return null;
                  return (
                    <div key={bid.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{player.lastName}</span>
                        <span className="text-emerald-400 font-black">£{((bid.amount || 0)/1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 font-medium">
                        <span className="truncate">{toClub.name}</span>
                        <ArrowRightLeft className="w-3 h-3 shrink-0" />
                        <span className="truncate text-indigo-400">{fromClub.name}</span>
                      </div>
                      <Badge className={cn(
                        "text-[8px] h-4",
                        bid.status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                      )}>
                        {bid.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-indigo-600/10 border-indigo-500/20">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Transfer Rumors</h4>
              <p className="text-xs text-indigo-200/60 leading-relaxed">
                Elite clubs are currently monitoring youth prospects in the lower leagues. Expect bids for high-potential players soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transfers;

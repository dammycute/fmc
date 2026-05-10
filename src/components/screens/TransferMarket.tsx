import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, ArrowRightLeft, 
  Search, Filter,
  MessageCircle, Scale, ShieldAlert, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const TransferMarket: React.FC = () => {
  const { players, clubs, userClubId, transferBids, negotiateBid } = useGameStore();
  const [activeTab, setActiveTab] = useState<'market' | 'inbox'>('market');
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [counterAmount, setCounterAmount] = useState<string>('');
  
  const userClub = clubs.find(c => c.id === userClubId);
  if (!userClub) return null;

  // Market List: Discovered players or top talent
  const marketPlayers = players
    .filter(p => p.clubId !== userClubId)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 20);

  // Inbox: Bids for MY players
  const incomingBids = (transferBids || []).filter(b => b.toClubId === userClubId && b.status !== 'CANCELLED');

  const handleNegotiate = () => {
    if (!selectedBid || !counterAmount) return;
    const amount = parseInt(counterAmount);
    if (isNaN(amount)) return;
    
    negotiateBid(selectedBid.id, amount);
    setSelectedBid(null);
    setCounterAmount('');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Transfer Center</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400">£{(userClub.finances.balance / 1000000).toFixed(1)}M BUDGET</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
              <span className="text-xs font-black text-indigo-400">{incomingBids.filter(b => b.status === 'PENDING').length} PENDING BIDS</span>
            </div>
          </div>
        </div>

        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'market' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Market pool
          </button>
          <button 
            onClick={() => setActiveTab('inbox')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === 'inbox' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Transfer Inbox
            {incomingBids.some(b => b.status === 'PENDING') && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-950" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'market' ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Available Talent</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 border-white/5 text-[10px] font-black text-zinc-400">
                <Filter className="w-3 h-3 mr-2" /> FILTER
              </Button>
              <Button variant="outline" size="sm" className="h-8 border-white/5 text-[10px] font-black text-zinc-400">
                <Search className="w-3 h-3 mr-2" /> SEARCH
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketPlayers.map(player => {
              const club = clubs.find(c => c.id === player.clubId);
              return (
                <Card key={player.id} className="bg-zinc-900 border-white/5 group hover:border-indigo-500/30 transition-all shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center font-black text-xl text-zinc-800 border border-white/5">
                          {player.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg tracking-tight">{player.firstName} {player.lastName}</h3>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{player.position} • {club?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-indigo-400">{(player.overallRating || 0).toFixed(0)}</div>
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Rating</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Market Value</p>
                        <p className="text-sm font-black text-white mt-0.5">£{(player.value / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Weekly Wage</p>
                        <p className="text-sm font-black text-white mt-0.5">£{(player.wage / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <Button className="w-full bg-white/5 hover:bg-indigo-600 text-white font-black h-10 rounded-xl transition-all uppercase tracking-widest text-[10px]">
                      Make Inquiry
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Negotiations Room</h2>
          {incomingBids.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-zinc-900 mx-auto" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">No active bids in your inbox.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {incomingBids.map(bid => {
                const player = players.find(p => p.id === bid.playerId);
                const fromClub = clubs.find(c => c.id === bid.fromClubId);
                if (!player) return null;

                return (
                  <Card key={bid.id} className={cn(
                    "bg-zinc-900 border-white/5 overflow-hidden transition-all",
                    bid.status === 'PENDING' ? "border-l-4 border-l-indigo-500" : "opacity-80"
                  )}>
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center font-black text-2xl text-indigo-500 border border-white/5">
                          {player.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-white tracking-tight">{player.firstName} {player.lastName}</h3>
                            <Badge className="bg-white/5 text-zinc-500 text-[8px] font-black border-white/5">{player.position}</Badge>
                          </div>
                          <p className="text-xs font-medium text-zinc-500">
                            Offer from <span className="text-white font-bold">{fromClub?.name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Offer Amount</p>
                          <p className="text-2xl font-black text-white italic">£{(bid.amount / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                          <Badge className={cn(
                            "px-3 py-1 font-black text-[9px] uppercase tracking-tighter",
                            bid.status === 'PENDING' ? "bg-indigo-500/10 text-indigo-400" : 
                            bid.status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            {bid.status === 'PENDING' ? `PENDING (${bid.negotiationCount}/3)` : bid.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {bid.status === 'PENDING' && (
                          <>
                            <Button 
                              onClick={() => setSelectedBid(bid)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-[10px]"
                            >
                              Negotiate
                            </Button>
                            <Button 
                              variant="destructive"
                              className="font-black h-12 px-6 rounded-xl uppercase tracking-widest text-[10px]"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {bid.status === 'ACCEPTED' && (
                          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 px-8 rounded-xl uppercase tracking-widest text-[10px]">
                            Finalize Deal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Negotiation Modal */}
      <Dialog open={!!selectedBid} onOpenChange={(open) => !open && setSelectedBid(null)}>
        <DialogContent className="bg-[#0c0c0e] border-white/5 text-white max-w-md p-8 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <Scale className="w-6 h-6 text-indigo-500" />
              Transfer Bargaining
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium pt-2">
              Bargaining attempt <span className="text-white font-bold">{selectedBid?.negotiationCount + 1} of 3</span>. Be realistic: extreme demands will cause the other club to walk away immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-8">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Current Offer</span>
                <span className="text-lg font-black text-indigo-400 italic">£{(selectedBid?.amount / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Player Value</span>
                <span className="text-sm font-bold text-zinc-400">£{((players.find(p => p.id === selectedBid?.playerId)?.value || 0) / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Counter-Offer (£)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  placeholder="e.g. 15000000"
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-white font-black placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span className="text-[8px] font-black text-rose-400 uppercase">Risk Level</span>
                </div>
                <p className="text-xs font-bold text-rose-200/60">High: Countering {'>'} 20% above value.</p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-[8px] font-black text-emerald-400 uppercase">AI Strategy</span>
                </div>
                <p className="text-xs font-bold text-emerald-200/60">Aggressive: Club wants immediate deal.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleNegotiate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20"
            >
              Submit Counter-Offer
            </Button>
            <Button 
              onClick={() => setSelectedBid(null)}
              variant="ghost" 
              className="w-full text-zinc-500 hover:text-white font-black h-12 rounded-2xl uppercase tracking-widest text-[10px]"
            >
              Cancel Negotiation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransferMarket;

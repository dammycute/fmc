import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { DollarSign, ArrowUpRight, ArrowDownRight, Building2, Ticket, Users2, Tv, ShoppingCart, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

const Finances: React.FC = () => {
  const { userClubId, clubs } = useGameStore();
  const club = clubs.find(c => c.id === userClubId);

  if (!club) return null;

  const totalRevenue = Object.values(club.finances.revenue).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(club.finances.expenses).reduce((a, b) => a + b, 0);
  const profitLoss = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-600/20">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest mb-1">Total Balance</p>
            <h2 className="text-4xl font-black text-white">£{((club.finances.balance || 0) / 1000000).toFixed(1)}M</h2>
            <div className="flex items-center gap-2 mt-4 text-indigo-100/80 text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-white/20">HEALTHY</span>
              <span>No active loans</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 glass-card hover-lift">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Weekly Profit/Loss</p>
            <div className="flex items-center gap-2">
              <h2 className={cn("text-3xl font-black", profitLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
                £{((Math.abs(profitLoss) || 0) / 1000).toFixed(1)}K
              </h2>
              {profitLoss >= 0 ? <ArrowUpRight className="text-emerald-400" /> : <ArrowDownRight className="text-rose-400" />}
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-medium">After all wages and maintenance</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 glass-card hover-lift">
          <CardContent className="p-6">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Annual Budget Left</p>
            <h2 className="text-3xl font-black text-white">£{(((club.finances.balance || 0) * 0.4) / 1000000).toFixed(1)}M</h2>
            <p className="text-xs text-zinc-500 mt-2 font-medium">Board reserved for transfers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" /> WEEKLY REVENUE
          </h3>
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
            {totalRevenue === 0 ? (
              <div className="p-12 text-center">
                <p className="text-xs text-zinc-500 font-black uppercase tracking-widest italic">Revenue data updates weekly</p>
              </div>
            ) : (
              <>
                {[
                  { label: 'Matchday Tickets', value: club.finances.revenue.tickets, icon: Ticket },
                  { label: 'Sponsorships', value: club.finances.revenue.sponsorship, icon: Briefcase },
                  { label: 'Merchandise', value: club.finances.revenue.merchandise, icon: ShoppingCart },
                  { label: 'TV Rights', value: club.finances.revenue.tvRights, icon: Tv },
                  { label: 'Prize Money', value: club.finances.revenue.prizeMoney, icon: Building2 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-mono text-emerald-400">+£{((item.value || 0) / 1000).toFixed(1)}K</span>
                  </div>
                ))}
                <div className="bg-emerald-500/5 p-4 flex justify-between items-center">
                  <span className="text-xs font-black text-emerald-400 uppercase">Total Revenue</span>
                  <span className="text-sm font-black text-emerald-400">£{((totalRevenue || 0) / 1000).toFixed(1)}K</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-rose-500" /> WEEKLY EXPENSES
          </h3>
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
            {[
              { label: 'Player Wages', value: club.finances.expenses.playerWages || club.finances.weeklyWages, icon: Users2 },
              { label: 'Staff Wages', value: club.finances.expenses.staffWages || club.finances.weeklyStaffWages, icon: Briefcase },
              { label: 'Facility Maintenance', value: club.finances.expenses.facilityMaintenance, icon: Building2 },
              { label: 'Loan Repayments', value: club.finances.expenses.loanRepayments, icon: DollarSign },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-bold text-zinc-300">{item.label}</span>
                </div>
                <span className="text-sm font-mono text-rose-400">-£{((item.value || 0) / 1000).toFixed(1)}K</span>
              </div>
            ))}
            <div className="bg-rose-500/5 p-4 flex justify-between items-center">
              <span className="text-xs font-black text-rose-400 uppercase">Total Expenses</span>
              <span className="text-sm font-black text-rose-400">£{((totalExpenses || 0) / 1000).toFixed(1)}K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;

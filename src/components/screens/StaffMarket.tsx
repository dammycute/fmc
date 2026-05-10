import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Users, Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StaffMarket: React.FC = () => {
  const { userClubId, clubs, managers, staff, hireManager, hireStaff } = useGameStore();
  const club = clubs.find(c => c.id === userClubId);
  const [activeTab, setActiveTab] = useState<'MANAGERS' | 'STAFF'>('MANAGERS');

  if (!club) return null;

  const reputation = club.reputation || 50;

  // Managers Scaled to Reputation
  let managerCandidates = managers
    .filter(m => !m.clubId && Math.abs(m.coachingAbility - reputation) <= 15)
    .sort((a, b) => b.coachingAbility - a.coachingAbility)
    .slice(0, 12);
    
  // Fallback if empty
  if (managerCandidates.length === 0) {
    managerCandidates = [
      { 
        id: 'mf-1', 
        name: 'Zinedine Zidane', 
        coachingAbility: Math.min(99, Math.floor(reputation + 5)), 
        preferredFormation: '4-3-3', 
        preferredStyle: 'ATTACKING', 
        philosophy: 'POSSESSION',
        coaching: { tactical: 90, workingWithYouth: 80, attacking: 85, defensive: 70, mental: 88 }, 
        personality: { playerManagement: 98, discipline: 85, loyalty: 90, ambition: 95, mediaHandling: 80 }, 
        clubId: '',
        morale: 80,
        relationshipWithChairman: 70,
        contractYears: 3,
        pressing: 75,
        creativeFreedom: 80,
        salary: Math.floor((reputation + 5) * 1000)
      },
      { 
        id: 'mf-2', 
        name: 'Jose Mourinho', 
        coachingAbility: Math.max(20, Math.floor(reputation - 5)), 
        preferredFormation: '4-2-3-1', 
        preferredStyle: 'DEFENSIVE', 
        philosophy: 'DEFENSIVE',
        coaching: { tactical: 98, workingWithYouth: 60, attacking: 65, defensive: 95, mental: 90 }, 
        personality: { playerManagement: 85, discipline: 98, loyalty: 80, ambition: 98, mediaHandling: 99 }, 
        clubId: '',
        morale: 75,
        relationshipWithChairman: 70,
        contractYears: 2,
        pressing: 90,
        creativeFreedom: 40,
        salary: Math.floor((reputation - 5) * 800)
      }
    ] as any;

  }

  const staffCandidates = (staff || [])
    .filter(s => !s.clubId && Math.abs(s.rating - reputation) <= 15)
    .slice(0, 15);



  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Professional Marketplace</h1>
          <p className="text-zinc-500 font-medium">Recruit world-class talent to lead your organization.</p>
        </div>
        
        <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('MANAGERS')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'MANAGERS' ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Managers
          </button>
          <button
            onClick={() => setActiveTab('STAFF')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'STAFF' ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Backroom Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeTab === 'MANAGERS' ? (
          managerCandidates.map(manager => (
            <Card key={manager.id} className="bg-zinc-900 border-white/5 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-24 h-24" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{manager.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-white/5 text-zinc-400 border-none font-black text-[8px] uppercase">{manager.preferredFormation}</Badge>
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-none font-black text-[8px] uppercase">{(manager.preferredStyle || '').replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">Rating: {manager.coachingAbility}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">£{(manager.salary / 1000).toFixed(1)}k / Week</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Tactical</p>
                    <p className="text-sm font-bold text-zinc-300">{manager.coaching.tactical}/99</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Management</p>
                    <p className="text-sm font-bold text-zinc-300">{manager.personality.playerManagement}/99</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Youth</p>
                    <p className="text-sm font-bold text-zinc-300">{manager.coaching.workingWithYouth}/99</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 pt-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500 font-medium italic">
                      "Prefers a {(manager.preferredStyle || '').toLowerCase().replace('_', ' ')} approach with a structured {manager.preferredFormation || 'N/A'}."
                    </p>

                  </div>
                  <Button 
                    onClick={() => hireManager(club.id, manager)}
                    className="bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-2xl shrink-0"
                  >
                    OFFER CONTRACT
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          staffCandidates.map(member => (
            <Card key={member.id} className="bg-zinc-900 border-white/5 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{member.name}</h3>
                      <Badge className="bg-indigo-600 text-white border-none font-black text-[8px] uppercase mt-1">{(member.role || '').replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{member.rating}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest italic">£{(member.salary / 1000).toFixed(1)}k / Week</p>
                  </div>
                </div>

                <Button 
                  onClick={() => hireStaff(club.id, member)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl border border-white/5"
                >
                  HIRE AS {(member.role || '').replace('_', ' ')}
                </Button>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {activeTab === 'MANAGERS' && managerCandidates.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/50 border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-zinc-600 font-black uppercase tracking-widest">No available managers</p>
        </div>
      )}
    </div>
  );
};

export default StaffMarket;

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Search, Briefcase, GraduationCap, HeartPulse, 
  LineChart, Bell, Globe
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface StaffScreenProps {
  setActiveTab: (tab: string) => void;
}

const StaffScreen: React.FC<StaffScreenProps> = ({ setActiveTab: setGlobalActiveTab }) => {
  const { userClubId, clubs, leagues, staff, managers, advertiseStaffRole, hireStaffApplicant, dismissStaff, hireStaff, hireManager } = useGameStore();
  const [activeTab, setActiveTab] = React.useState('overview');

  const club = clubs.find(c => c.id === userClubId);
  const clubStaff = (staff || []).filter(s => s.clubId === userClubId);
  
  if (!club) return null;

  const handleHireManager = (manager: any) => {
    hireManager(club.id, manager);
    setGlobalActiveTab('manager'); // Direct navigation to manager profile
  };

  const handleHireStaff = (staffMember: any) => {
    hireStaff(club.id, staffMember);
    setActiveTab('overview'); // Show the staff on the 'My Team' tab of this screen
  };

  const handleHireApplicant = (applicantId: string) => {
    hireStaffApplicant(club.id, applicantId);
    setActiveTab('overview');
  };


  const roles = [
    { id: 'SPORTING_DIRECTOR', label: 'Sporting Director', icon: Briefcase, color: 'text-indigo-400', description: 'Negotiates transfers, reduces bid costs, generates market recommendations' },
    { id: 'SCOUT', label: 'Chief Scout', icon: Search, color: 'text-sky-400', description: 'Discovers players — higher rating = more accurate reported stats' },
    { id: 'PHYSIO', label: 'Head Physio', icon: HeartPulse, color: 'text-rose-400', description: 'Reduces injury risk and fatigue per week — directly affects player availability' },
    { id: 'ANALYST', label: 'Performance Analyst', icon: LineChart, color: 'text-emerald-400', description: 'Generates post-match reports — improves tactical familiarity gain' },
    { id: 'ACADEMY_COACH', label: 'Academy Manager', icon: GraduationCap, color: 'text-amber-400', description: 'Accelerates U21 development and improves youth intake quality' },
  ];

  // 1. Managers Scaled to Club League Tier
  const reputation = club.reputation || 50;
  const leagueTier = (() => {
    const league = leagues.find(l => String(l.id) === String(club.leagueId));
    return league?.tier || 5;
  })();

  // Tier-based ability ranges for suitable managers
  const tierAbilityRanges: Record<number, { min: number; max: number }> = {
    1: { min: 65, max: 99 },
    2: { min: 50, max: 85 },
    3: { min: 35, max: 70 },
    4: { min: 25, max: 55 },
    5: { min: 15, max: 50 },
  };
  const abilityRange = tierAbilityRanges[leagueTier] || tierAbilityRanges[5];

  const managerCandidates = (managers || [])
    .filter(m => !m.clubId && m.coachingAbility >= abilityRange.min && m.coachingAbility <= abilityRange.max)
    .sort((a, b) => b.coachingAbility - a.coachingAbility)
    .slice(0, 20);

  // 2. Staff Scaled to Club Reputation
  let marketplaceStaff = (staff || [])
    .filter(s => !s.clubId && Math.abs(s.rating - reputation) <= 15)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
    
  if (marketplaceStaff.length === 0) {
    marketplaceStaff = [
      { id: 'fs-1', name: 'Marco Silva', role: 'SPORTING_DIRECTOR', rating: Math.min(99, Math.floor(reputation + 2)), salary: Math.floor((reputation + 2) * 150), clubId: '', isApplicant: false },
      { id: 'fs-2', name: 'Emma Wilson', role: 'PHYSIO', rating: Math.max(20, Math.floor(reputation - 5)), salary: Math.floor((reputation - 5) * 120), clubId: '', isApplicant: false }
    ] as any;
  }


  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Recruitment Center</h1>
          <p className="text-zinc-500 font-medium">Build an elite backroom team scaled to your level.</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-white/5 border-white/10 text-zinc-400 px-4 py-2">
            <Bell className="w-4 h-4 mr-2" /> {club.staffApplicants?.length || 0} APPLICANTS
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-950/50 p-1 border border-white/5 rounded-2xl mb-8">
          <TabsTrigger value="overview" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">My Team</TabsTrigger>
          <TabsTrigger value="applicants" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Applications</TabsTrigger>
          <TabsTrigger value="managers" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Managers</TabsTrigger>
          <TabsTrigger value="marketplace" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Staff Market</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const members = clubStaff.filter(s => s.role === role.id);
              return (
                <Card key={role.id} className="bg-zinc-900 border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn("w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5", role.color)}>
                        <role.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{role.label}</h3>
                        <p className={cn("text-sm leading-tight", members.length > 0 ? "text-zinc-400" : "text-amber-300 italic")}>{role.description}</p>
                        <p className={cn("text-xl font-black leading-tight mt-3", members.length > 0 ? "text-white" : "text-zinc-500 italic")}>{members.length > 0 ? `${members.length} Active` : 'ROLE VACANT'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {members.map(member => (
                        <div key={member.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                          <div className="flex justify-between items-center">
                             <p className="text-sm font-black text-white">{member.name}</p>
                             <p className="text-xs font-black text-indigo-400">{member.rating}%</p>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${member.rating}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {role.id === 'PHYSIO' && `~${Math.floor(member.rating / 2)}% injury reduction`}
                            {role.id === 'SCOUT' && `~${Math.floor(member.rating)}% report accuracy`}
                            {role.id === 'ACADEMY_COACH' && `+${(member.rating / 100 * 0.05).toFixed(2)} rating/week for U21s`}
                            {role.id === 'SPORTING_DIRECTOR' && `~${Math.floor(member.rating / 15)}% bid reduction`}
                            {role.id === 'ANALYST' && `+${Math.floor(member.rating / 20)}% tac. familiarity/week`}
                          </p>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-widest">£{member.salary.toLocaleString()}/wk</span>
                            <button 
                              onClick={() => dismissStaff(member.id)}
                              className="text-rose-500 hover:text-rose-400 font-black uppercase tracking-tighter"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {members.length === 0 && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 border-dashed">
                          <p className="text-[10px] text-amber-300 font-bold text-center italic uppercase">No active specialist</p>
                        </div>
                      )}

                      <Button 
                        onClick={() => advertiseStaffRole(club.id, role.id as any)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 mt-2"
                        disabled={club.staffAds?.some(ad => ad.role === role.id)}
                      >
                        {club.staffAds?.some(ad => ad.role === role.id) ? 'ADVERTISEMENT LIVE' : 'POST RECRUITMENT AD (£50K)'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="mt-0 space-y-4">
          {club.staffApplicants?.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto">
                <Bell className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Active Applications</h3>
              <p className="text-zinc-500 max-w-xs mx-auto text-sm">Post an advertisement to attract specialists.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {club.staffApplicants?.map(applicant => (
                <div key={applicant.id} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl font-black text-indigo-500 border border-white/5 group-hover:scale-110 transition-transform">
                      {applicant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-white tracking-tight">{applicant.name}</h4>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-black">{(applicant.role || '').replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">Rating: <span className="text-white font-bold">{applicant.rating}%</span> • Salary: <span className="text-emerald-400 font-bold">£{applicant.salary.toLocaleString()}/wk</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleHireApplicant(applicant.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20"
                    >
                      Hire Specialist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="managers" className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
          {managerCandidates.map(manager => (
            <div key={manager.id} className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col gap-6 group">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{manager.name}</h4>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{manager.preferredStyle} • {manager.preferredFormation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{manager.coachingAbility}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Ability</p>
                  </div>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-white/5">
                 <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest italic">£{(manager.salary / 1000).toFixed(1)}k / Week</p>
                 <Button onClick={() => handleHireManager(manager)} className="bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-widest px-8">OFFER CONTRACT</Button>
               </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="marketplace" className="mt-0">
          <div className="bg-indigo-600/5 border border-indigo-600/10 p-4 rounded-2xl mb-8 flex items-center gap-4">
            <Globe className="w-5 h-5 text-indigo-400" />
            <p className="text-sm text-indigo-200/60 font-medium italic">Global specialists appropriate for your club's reputation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketplaceStaff.map(s => (
              <div key={s.id} className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-between group hover:bg-zinc-800 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 flex items-center justify-center text-3xl font-black text-indigo-500 border border-white/5">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white tracking-tight">{s.name}</h4>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{(s.role || '').replace('_', ' ')}</p>
                    <p className="text-xs font-bold text-zinc-400">{s.rating}% Rating • <span className="text-emerald-500">£{s.salary.toLocaleString()}/wk</span></p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleHireStaff(s as any)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black px-6 h-12 uppercase text-[10px] tracking-widest border border-white/10"
                >
                  Hire
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );



};

export default StaffScreen;

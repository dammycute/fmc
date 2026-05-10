import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users2, Search, Briefcase, GraduationCap, HeartPulse, 
  LineChart, UserPlus, X, Bell, Globe, UserCheck 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const StaffScreen: React.FC = () => {
  const { userClubId, clubs, staff, advertiseStaffRole, hireStaffApplicant, dismissStaff } = useGameStore();
  const [activeTab, setActiveTab] = useState('overview');

  const club = clubs.find(c => c.id === userClubId);
  const clubStaff = staff.filter(s => s.clubId === userClubId);
  
  if (!club) return null;

  const roles = [
    { id: 'SPORTING_DIRECTOR', label: 'Sporting Director', icon: Briefcase, color: 'text-indigo-400' },
    { id: 'SCOUT', label: 'Chief Scout', icon: Search, color: 'text-sky-400' },
    { id: 'PHYSIO', label: 'Head Physio', icon: HeartPulse, color: 'text-rose-400' },
    { id: 'ANALYST', label: 'Performance Analyst', icon: LineChart, color: 'text-emerald-400' },
    { id: 'ACADEMY_COACH', label: 'Academy Manager', icon: GraduationCap, color: 'text-amber-400' },
  ];

  // Simulated Global Marketplace (Free Agents)
  const marketplaceStaff = [
    { id: 'm1', name: 'Marco Silva', role: 'SPORTING_DIRECTOR', rating: 82, salary: 5000, isApplicant: false },
    { id: 'm2', name: 'Emma Wilson', role: 'PHYSIO', rating: 75, salary: 2500, isApplicant: false },
    { id: 'm3', name: 'Hans Gruber', role: 'ANALYST', rating: 88, salary: 6500, isApplicant: false },
    { id: 'm4', name: 'Sarah Jones', role: 'SCOUT', rating: 71, salary: 1800, isApplicant: false },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Recruitment Center</h1>
          <p className="text-zinc-500 font-medium">Build an elite backroom team to dominate the league.</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-white/5 border-white/10 text-zinc-400 px-4 py-2">
            <Bell className="w-4 h-4 mr-2" /> {club.staffApplicants?.length || 0} APPLICANTS
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-950/50 p-1 border border-white/5 rounded-2xl mb-8">
          <TabsTrigger value="overview" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">My Team</TabsTrigger>
          <TabsTrigger value="applicants" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Applications</TabsTrigger>
          <TabsTrigger value="marketplace" className="rounded-xl px-8 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const member = clubStaff.find(s => s.role === role.id);
              return (
                <Card key={role.id} className="bg-zinc-900 border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn("w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5", role.color)}>
                        <role.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{role.label}</h3>
                        <p className={cn("text-xl font-black leading-tight", member ? "text-white" : "text-zinc-700 italic")}>
                          {member ? member.name : 'ROLE VACANT'}
                        </p>
                      </div>
                    </div>

                    {member ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Rating</p>
                            <p className="text-xl font-black text-white">{member.rating}%</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Salary</p>
                            <p className="text-sm font-black text-emerald-400">£{member.salary.toLocaleString()}/wk</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => dismissStaff(member.id)}
                          variant="ghost" 
                          className="w-full text-[10px] font-black text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 h-10 uppercase tracking-widest border border-rose-500/10"
                        >
                          Terminate Contract
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 border-dashed">
                          <p className="text-[10px] text-indigo-400 font-bold text-center italic uppercase">No active specialist</p>
                        </div>
                        <Button 
                          onClick={() => advertiseStaffRole(club.id, role.id as any)}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20"
                          disabled={club.staffAds?.some(ad => ad.role === role.id)}
                        >
                          {club.staffAds?.some(ad => ad.role === role.id) ? 'ADVERTISEMENT LIVE' : 'POST ADVERT (£50K)'}
                        </Button>
                      </div>
                    )}
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
              <p className="text-zinc-500 max-w-xs mx-auto text-sm">Post an advertisement to attract specialists to your club.</p>
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
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-black">{applicant.role.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">Rating: <span className="text-white font-bold">{applicant.rating}%</span> • Expected Salary: <span className="text-emerald-400 font-bold">£{applicant.salary.toLocaleString()}/wk</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => hireStaffApplicant(club.id, applicant.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20"
                    >
                      Hire Specialist
                    </Button>
                    <Button variant="outline" className="border-white/10 text-zinc-500 hover:text-white h-12 w-12 p-0">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="mt-0">
          <div className="bg-indigo-600/5 border border-indigo-600/10 p-4 rounded-2xl mb-8 flex items-center gap-4">
            <Globe className="w-5 h-5 text-indigo-400" />
            <p className="text-sm text-indigo-200/60 font-medium italic">The global marketplace shows elite free agents currently seeking a high-profile project.</p>
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
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{s.role.replace('_', ' ')}</p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-400">{s.rating}% Rating</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs font-bold text-emerald-500">£{s.salary.toLocaleString()}/wk</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="bg-white/5 hover:bg-white/10 text-white font-black px-6 h-12 uppercase text-[10px] tracking-widest border border-white/10">
                  Negotiate
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

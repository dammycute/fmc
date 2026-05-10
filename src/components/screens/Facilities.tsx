import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Home, Activity, GraduationCap, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const Facilities: React.FC = () => {
  const { userClubId, clubs, upgradeFacility } = useGameStore();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const club = clubs.find(c => c.id === userClubId);

  if (!club) return null;

  const facilityList = [
    { 
      id: 'stadium', 
      label: 'Stadium', 
      icon: Home, 
      level: club.facilities.stadium.level, 
      cost: club.facilities.stadium.upgradeCost,
      description: `Capacity: ${club.facilities.stadium.capacity.toLocaleString()}`,
      benefit: 'Increases matchday revenue and corporate prestige.'
    },
    { 
      id: 'trainingGround', 
      label: 'Training Ground', 
      icon: Activity, 
      level: club.facilities.trainingGround.level, 
      cost: club.facilities.trainingGround.upgradeCost,
      description: 'Affects player growth speed',
      benefit: 'Higher level = Faster player development and attribute gains.'
    },
    { 
      id: 'medicalCenter', 
      label: 'Medical Center', 
      icon: Activity, 
      level: club.facilities.medicalCenter.level, 
      cost: club.facilities.medicalCenter.upgradeCost,
      description: 'Affects recovery speed',
      benefit: 'Reduces injury frequency and accelerates return-to-play.'
    },
    { 
      id: 'youthAcademy', 
      label: 'Youth Academy', 
      icon: GraduationCap, 
      level: club.facilities.youthAcademy.level, 
      cost: club.facilities.youthAcademy.upgradeCost,
      description: 'Annual youth intake quality',
      benefit: 'Significantly increases the chance of producing world-class wonderkids.'
    },
  ];

  const handleUpgradeClick = (facility: any) => {
    setSelectedFacility(facility);
    setIsConfirmOpen(true);
  };

  const confirmUpgrade = () => {
    if (selectedFacility) {
      upgradeFacility(club.id, selectedFacility.id);
      setIsConfirmOpen(false);
      setSelectedFacility(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Infrastructure</h1>
        <p className="text-zinc-500 font-medium max-w-2xl">Investing in facilities is the foundation of long-term success. Higher level facilities attract better players and staff.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilityList.map((facility) => (
          <Card key={facility.id} className="bg-zinc-900 border-white/5 overflow-hidden group shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center text-indigo-400 border border-white/5 group-hover:scale-105 transition-all">
                    <facility.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{facility.label}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Level</span>
                      <div className="flex gap-1.5">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-4 h-2 rounded-sm transition-all duration-500",
                              i < facility.level ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" : "bg-white/5"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Efficiency</p>
                  <p className="text-xl font-black text-white">{facility.level * 10}%</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-white/5 mb-8">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Technical Analysis</p>
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">{facility.benefit}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Investment Required</span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tighter">£{((facility.cost || 0) / 1000000).toFixed(1)}M</span>
                </div>
                <Button 
                  disabled={club.finances.balance < facility.cost || facility.level >= 10}
                  onClick={() => handleUpgradeClick(facility)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-14 px-10 rounded-2xl gap-3 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-xs tracking-widest uppercase"
                >
                  <ArrowUpCircle className="w-5 h-5" /> 
                  {facility.level >= 10 ? 'Elite Tier' : 'Authorize Upgrade'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-[#0c0c0e] border-white/5 text-white max-w-md p-8 rounded-[2rem]">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-center tracking-tight">Authorize Infrastructure Spending?</DialogTitle>
            <DialogDescription className="text-zinc-500 text-center text-sm font-medium leading-relaxed">
              You are about to authorize a <span className="text-white font-bold">£{((selectedFacility?.cost || 0) / 1000000).toFixed(1)}M</span> investment for the <span className="text-white font-bold">{selectedFacility?.label}</span>. This action is final and will immediately impact club liquid reserves.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 mt-8">
            <Button 
              onClick={confirmUpgrade}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/10"
            >
              Confirm Authorization
            </Button>
            <Button 
              onClick={() => setIsConfirmOpen(false)}
              variant="ghost" 
              className="w-full text-zinc-500 hover:text-white font-black h-12 rounded-2xl uppercase tracking-widest text-[10px]"
            >
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facilities;

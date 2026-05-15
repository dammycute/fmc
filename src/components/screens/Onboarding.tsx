import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Search, MapPin,
    TrendingUp,
    Wallet, ArrowRight, Check, Landmark, Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnboardingProps {
    onComplete: () => void;
}



const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { clubs, leagues, buyClub, personalBalance } = useGameStore();
    const [step, setStep] = useState<'welcome' | 'select' | 'rename' | 'confirm'>('welcome');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('all');
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    // Only show non-league / lower tier clubs
    const availableClubs = clubs
        .filter(c => !c.isUserControlled)
        .filter(c => {
            const league = leagues.find(l => String(l.id) === String(c.leagueId));
            return league && league.tier >= 3; // Start from Tier 3 (non-league / lower)
        })
        .filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchLeague = selectedLeagueFilter === 'all' || String(c.leagueId) === String(selectedLeagueFilter);
            return matchSearch && matchLeague;
        })
        .sort((a, b) => a.valuation - b.valuation);

    const selectedClub = clubs.find(c => String(c.id) === String(selectedClubId));
    const selectedLeague = leagues.find(l => String(l.id) === String(selectedClub?.leagueId));

    const canAfford = selectedClub ? personalBalance >= selectedClub.valuation : false;

    const lowerLeagues = leagues.filter(l => l.tier >= 3);

    const handleBuyAndRename = async () => {
        if (!selectedClubId || !canAfford) return;
        await buyClub(selectedClubId, newName.trim() || undefined);
        setConfirmed(true);
        setTimeout(() => onComplete(), 1500);
    };

    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
                <div className="max-w-2xl w-full space-y-12">
                    {/* Logo */}
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40">
                            <span className="text-3xl font-black text-white">FC</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Chairman</h1>
                        <p className="text-zinc-500 font-medium text-lg">Build an empire from the bottom of the pyramid.</p>
                    </div>

                    {/* Intro Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            {
                                icon: Wallet,
                                title: 'Starting Wealth: £1,000,000',
                                desc: 'You begin as a non-league chairman. Money is tight. Every penny counts.',
                                color: 'text-amber-400',
                                bg: 'bg-amber-500/10 border-amber-500/20'
                            },
                            {
                                icon: Landmark,
                                title: 'Buy a Club',
                                desc: 'Acquire a struggling non-league club. Rename it. Make it yours.',
                                color: 'text-indigo-400',
                                bg: 'bg-indigo-500/10 border-indigo-500/20'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Rise Through the Pyramid',
                                desc: 'Promote through the leagues. Win titles. Build facilities. Attract sponsorship.',
                                color: 'text-emerald-400',
                                bg: 'bg-emerald-500/10 border-emerald-500/20'
                            },
                        ].map((item, i) => (
                            <div key={i} className={cn("p-5 rounded-2xl border flex items-start gap-4", item.bg)}>
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>
                                <div>
                                    <p className={cn("font-black text-sm uppercase tracking-wide", item.color)}>{item.title}</p>
                                    <p className="text-zinc-400 text-xs font-medium mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={() => setStep('select')}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3"
                    >
                        BEGIN YOUR JOURNEY <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'select') {
        return (
            <div className="min-h-screen bg-[#09090b] p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Club Acquisition</h1>
                            <p className="text-zinc-500 font-medium mt-1">Select a club to purchase. Your starting capital is limited.</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <Wallet className="w-5 h-5 text-amber-400" />
                            <div>
                                <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest">Available Funds</p>
                                <p className="text-xl font-black text-amber-400">£{(personalBalance / 1000000).toFixed(1)}M</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                placeholder="Search clubs..."
                                className="bg-zinc-900 border-white/5 pl-11 h-12 text-white placeholder:text-zinc-600 rounded-xl"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedLeagueFilter('all')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    selectedLeagueFilter === 'all'
                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                        : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                                )}
                            >All Leagues</button>
                            {lowerLeagues.map(league => (
                                <button
                                    key={league.id}
                                    onClick={() => setSelectedLeagueFilter(league.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        selectedLeagueFilter === league.id
                                            ? "bg-indigo-600 border-indigo-500 text-white"
                                            : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {league.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Club Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {availableClubs.map(club => {
                            const league = leagues.find(l => l.id === club.leagueId);
                            const affordable = personalBalance >= club.valuation;
                            const isSelected = selectedClubId === club.id;

                            return (
                                <div
                                    key={club.id}
                                    onClick={() => affordable && setSelectedClubId(isSelected ? null : club.id)}
                                    className={cn(
                                        "relative rounded-2xl border overflow-hidden transition-all cursor-pointer group",
                                        isSelected
                                            ? "border-indigo-500 shadow-xl shadow-indigo-500/20 bg-zinc-900"
                                            : affordable
                                                ? "border-white/5 bg-zinc-900 hover:border-white/15"
                                                : "border-white/5 bg-zinc-950 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center z-10">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${club.primaryColor}, ${club.secondaryColor})` }} />
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{club.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="w-3 h-3 text-zinc-500" />
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{league?.name}</span>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase border-none",
                                                club.reputation > 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                            )}>
                                                Rep: {club.reputation.toFixed(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center">
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase">Capacity</p>
                                                <p className="text-xs font-black text-zinc-300 mt-0.5">{(club.facilities.stadium.capacity / 1000).toFixed(1)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase">Balance</p>
                                                <p className="text-xs font-black text-emerald-400 mt-0.5">£{(club.finances.balance / 1000).toFixed(1)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase">Wages/wk</p>
                                                <p className="text-xs font-black text-rose-400 mt-0.5">£{(club.finances.weeklyWages / 1000).toFixed(1)}k</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Purchase Price</p>
                                                <p className={cn("text-xl font-black italic", affordable ? "text-white" : "text-zinc-600")}>
                                                    £{(club.valuation / 1000).toFixed(1)}K
                                                </p>
                                            </div>
                                            {!affordable && (
                                                <span className="text-[9px] font-black text-rose-400 uppercase">Too expensive</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {availableClubs.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                            <Landmark className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">No clubs match your search</p>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setStep('welcome')}
                            className="text-zinc-500 hover:text-white font-black h-12 px-8 rounded-2xl uppercase tracking-widest text-[10px]"
                        >
                            Back
                        </Button>
                        <Button
                            disabled={!selectedClubId || !canAfford}
                            onClick={() => setStep('rename')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 disabled:opacity-40"
                        >
                            {selectedClubId ? `Acquire ${selectedClub?.name} →` : 'Select a Club to Continue'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'rename') {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
                <div className="max-w-lg w-full space-y-10">
                    <div className="text-center space-y-3">
                        <div
                            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black text-white shadow-2xl"
                            style={{ backgroundColor: selectedClub?.primaryColor }}
                        >
                            {(newName || selectedClub?.name || '?').charAt(0)}
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Name Your Club</h1>
                        <p className="text-zinc-500 text-sm font-medium">Give your club a new identity, or keep its original name.</p>
                    </div>

                    {/* Current Info */}
                    <Card className="bg-zinc-900 border-white/5">
                        <CardContent className="p-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Original Name</span>
                                <span className="text-sm font-black text-zinc-400">{selectedClub?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">League</span>
                                <span className="text-sm font-black text-zinc-400">{selectedLeague?.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Acquisition Cost</span>
                                <span className="text-sm font-black text-amber-400">£{((selectedClub?.valuation || 0) / 1000).toFixed(1)}K</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">New Club Name (optional)</label>
                        <Input
                            placeholder={selectedClub?.name}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="bg-zinc-900 border-white/10 text-white text-lg font-black h-14 rounded-2xl placeholder:text-zinc-700"
                        />
                        <p className="text-[10px] text-zinc-600 italic">Leave blank to keep the original name. You can rename later in the Boardroom.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setStep('select')}
                            className="text-zinc-500 hover:text-white font-black h-12 px-8 rounded-2xl uppercase tracking-widest text-[10px]"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setStep('confirm')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black h-12 rounded-2xl uppercase tracking-widest text-[10px]"
                        >
                            Continue →
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'confirm') {
        const finalName = newName.trim() || selectedClub?.name || '';

        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
                <div className="max-w-lg w-full space-y-10">
                    {confirmed ? (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-600/30 animate-pulse">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Welcome, Chairman</h2>
                                <p className="text-zinc-500 mt-2">{finalName} is now under your control.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-3">
                                <Shield className="w-12 h-12 text-indigo-400 mx-auto" />
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Confirm Acquisition</h1>
                                <p className="text-zinc-500 text-sm font-medium">Review the deal before committing.</p>
                            </div>

                            <Card className="bg-zinc-900 border-white/5 overflow-hidden">
                                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${selectedClub?.primaryColor}, ${selectedClub?.secondaryColor})` }} />
                                <CardContent className="p-8 space-y-5">
                                    <div className="text-center space-y-2">
                                        <div
                                            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-white"
                                            style={{ backgroundColor: selectedClub?.primaryColor }}
                                        >
                                            {finalName.charAt(0)}
                                        </div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">{finalName}</h2>
                                        <p className="text-zinc-500 text-sm">{selectedLeague?.name} · {selectedLeague?.country}</p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        {[
                                            { label: 'Purchase Price', value: `£${((selectedClub?.valuation || 0) / 1000).toFixed(1)}K`, color: 'text-rose-400' },
                                            { label: 'Club Balance (inherited)', value: `£${((selectedClub?.finances.balance || 0) / 1000).toFixed(1)}K`, color: 'text-emerald-400' },
                                            { label: 'Weekly Wages Bill', value: `£${((selectedClub?.finances.weeklyWages || 0) / 1000).toFixed(1)}K`, color: 'text-amber-400' },
                                            { label: 'Remaining Personal Wealth', value: `£${((personalBalance - (selectedClub?.valuation || 0)) / 1000000).toFixed(1)}M`, color: 'text-zinc-300' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                                <span className={cn("text-sm font-black", item.color)}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <p className="text-[10px] text-zinc-600 text-center italic leading-relaxed">
                                This is a non-league club with limited resources. Build from the ground up — improve facilities, hire scouts, sign players on the cheap, and earn promotion to unlock greater revenue.
                            </p>

                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep('rename')}
                                    className="text-zinc-500 hover:text-white font-black h-12 px-8 rounded-2xl uppercase tracking-widest text-[10px]"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleBuyAndRename}
                                    className="flex-1 bg-white text-black hover:bg-zinc-200 font-black h-12 rounded-2xl uppercase tracking-widest text-[10px]"
                                >
                                    SIGN THE DEAL
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default Onboarding;

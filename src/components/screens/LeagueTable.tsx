import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const LeagueTable: React.FC = () => {
  const { userClubId, clubs, leagues, matches, currentSeason } = useGameStore();
  
  const userClub = clubs.find(c => c.id === userClubId);
  if (!userClub) return null;

  const currentLeague = leagues.find(l => l.id === userClub.leagueId);
  const leagueClubs = clubs.filter(c => c.leagueId === userClub.leagueId);

  // Calculate Table
  const table = leagueClubs.map(club => {
    const clubMatches = matches.filter(m => (m.homeClubId === club.id || m.awayClubId === club.id) && m.played);
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;

    clubMatches.forEach(m => {
      played++;
      const isHome = m.homeClubId === club.id;
      const goalsFor = isHome ? m.homeScore : m.awayScore;
      const goalsAgainst = isHome ? m.awayScore : m.homeScore;
      
      gf += goalsFor;
      ga += goalsAgainst;

      if (goalsFor > goalsAgainst) {
        won++;
        points += 3;
      } else if (goalsFor === goalsAgainst) {
        drawn++;
        points += 1;
      } else {
        lost++;
      }
    });

    return {
      ...club,
      played, won, drawn, lost, gf, ga, gd: gf - ga, points
    };
  }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{currentLeague?.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-600/20 px-3 py-1 font-black text-[10px] uppercase">Tier {currentLeague?.tier}</Badge>
            <span className="text-zinc-500 font-medium text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {currentLeague?.country}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Season</p>
          <p className="text-xl font-black text-white">{currentSeason}/{currentSeason + 1}</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-white/5 overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-12">Pos</th>
                <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Club</th>
                <th className="py-4 px-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-12">P</th>
                <th className="py-4 px-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-12">W</th>
                <th className="py-4 px-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-12">D</th>
                <th className="py-4 px-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-12">L</th>
                <th className="py-4 px-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center w-12">GD</th>
                <th className="py-4 px-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center w-16">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                    row.id === userClubId && "bg-indigo-600/5"
                  )}
                >
                  <td className="py-4 px-6">
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-md text-xs font-black",
                      index === 0 ? "bg-amber-500 text-black" : 
                      index < 4 ? "bg-indigo-500/20 text-indigo-400" : 
                      index > table.length - 4 ? "bg-rose-500/20 text-rose-400" : "text-zinc-500"
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-8 rounded-full" 
                        style={{ backgroundColor: row.primaryColor }}
                      />
                      <span className={cn(
                        "font-bold text-sm",
                        row.id === userClubId ? "text-white" : "text-zinc-300"
                      )}>
                        {row.name}
                      </span>
                      {row.id === userClubId && (
                        <Badge className="bg-indigo-600 text-white text-[8px] font-black h-4 px-1.5 uppercase">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-400">{row.played}</td>
                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-400">{row.won}</td>
                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-400">{row.drawn}</td>
                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-400">{row.lost}</td>
                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-400">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="py-4 px-6 text-center text-sm font-black text-white">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Promotion Zone</p>
            <p className="text-xs text-indigo-200/60 font-medium">Top 4 qualify for promotion play-offs.</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Relegation Zone</p>
            <p className="text-xs text-rose-200/60 font-medium">Bottom 3 are relegated to Tier {currentLeague!.tier + 1}.</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-zinc-500/5 border border-zinc-500/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-500/20 flex items-center justify-center text-zinc-500">
            <Minus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mid-Table Safety</p>
            <p className="text-xs text-zinc-200/60 font-medium">Secure positions with no direct movement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueTable;

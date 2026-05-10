import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type LeagueTableEntry } from '../../types/game';
import { cn } from '../../lib/utils';

const Standings: React.FC = () => {
  const { clubs, matches, currentSeason, userClubId } = useGameStore();

  const table = useMemo(() => {
    const entries: Record<string, LeagueTableEntry> = {};

    clubs.forEach((club) => {
      entries[club.id] = {
        clubId: club.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      };
    });

    matches
      .filter((m) => m.season === currentSeason && m.played)
      .forEach((m) => {
        const home = entries[m.homeClubId];
        const away = entries[m.awayClubId];

        if (home && away) {
          home.played++;
          away.played++;
          home.gf += m.homeScore;
          home.ga += m.awayScore;
          away.gf += m.awayScore;
          away.ga += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.won++;
            away.lost++;
            home.points += 3;
          } else if (m.homeScore < m.awayScore) {
            away.won++;
            home.lost++;
            away.points += 3;
          } else {
            home.drawn++;
            away.drawn++;
            home.points += 1;
            away.points += 1;
          }
        }
      });

    return Object.values(entries).map(e => ({ ...e, gd: e.gf - e.ga })).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [clubs, matches, currentSeason]);

  return (
    <Card className="bg-zinc-900 border-white/5">
      <CardHeader>
        <CardTitle className="text-white">League Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-10 text-zinc-500">Pos</TableHead>
              <TableHead className="text-zinc-500">Club</TableHead>
              <TableHead className="text-center text-zinc-500">P</TableHead>
              <TableHead className="text-center text-zinc-500">W</TableHead>
              <TableHead className="text-center text-zinc-500">D</TableHead>
              <TableHead className="text-center text-zinc-500">L</TableHead>
              <TableHead className="text-center text-zinc-500">GD</TableHead>
              <TableHead className="text-center font-bold text-zinc-500">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((entry, index) => {
              const club = clubs.find((c) => c.id === entry.clubId);
              return (
                <TableRow key={entry.clubId} className={cn("border-white/5", club?.id === userClubId ? 'bg-indigo-500/10' : '')}>
                  <TableCell className="text-zinc-400">{index + 1}</TableCell>
                  <TableCell className="font-bold text-white">{club?.name}</TableCell>
                  <TableCell className="text-center text-zinc-300">{entry.played}</TableCell>
                  <TableCell className="text-center text-zinc-300">{entry.won}</TableCell>
                  <TableCell className="text-center text-zinc-300">{entry.drawn}</TableCell>
                  <TableCell className="text-center text-zinc-300">{entry.lost}</TableCell>
                  <TableCell className="text-center text-zinc-300">{entry.gd}</TableCell>
                  <TableCell className="text-center font-black text-white">{entry.points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Standings;

import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LeagueTableEntry } from '../../types/game';

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
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    matches
      .filter((m) => m.season === currentSeason)
      .forEach((m) => {
        const home = entries[m.homeClubId];
        const away = entries[m.awayClubId];

        if (home && away) {
          home.played++;
          away.played++;
          home.goalsFor += m.homeScore;
          home.goalsAgainst += m.awayScore;
          away.goalsFor += m.awayScore;
          away.goalsAgainst += m.homeScore;

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

    return Object.values(entries).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });
  }, [clubs, matches, currentSeason]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Pos</TableHead>
              <TableHead>Club</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((entry, index) => {
              const club = clubs.find((c) => c.id === entry.clubId);
              return (
                <TableRow key={entry.clubId} className={club?.id === userClubId ? 'bg-muted/50' : ''}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{club?.name}</TableCell>
                  <TableCell className="text-center">{entry.played}</TableCell>
                  <TableCell className="text-center">{entry.won}</TableCell>
                  <TableCell className="text-center">{entry.drawn}</TableCell>
                  <TableCell className="text-center">{entry.lost}</TableCell>
                  <TableCell className="text-center">{entry.goalsFor - entry.goalsAgainst}</TableCell>
                  <TableCell className="text-center font-bold">{entry.points}</TableCell>
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

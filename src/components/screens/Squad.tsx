import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Squad: React.FC = () => {
  const { players, userClubId } = useGameStore();
  const squad = players.filter((p) => p.clubId === userClubId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Squad Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Potential</TableHead>
              <TableHead>Personality</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Wage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {squad.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.firstName} {player.lastName}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>{player.overallRating.toFixed(0)}</TableCell>
                <TableCell>{player.potentialRating.toFixed(0)}</TableCell>
                <TableCell className="text-xs">{player.personality.replace('_', ' ')}</TableCell>
                <TableCell>£{player.value.toLocaleString()}</TableCell>
                <TableCell>£{player.wage.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Squad;

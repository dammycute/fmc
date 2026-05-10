import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TransferMarket: React.FC = () => {
  const { players, clubs, userClubId, buyPlayer } = useGameStore();
  const userClub = clubs.find(c => c.id === userClubId);
  
  // Show players not in user's club, sorted by rating
  const transferList = players
    .filter((p) => p.clubId !== userClubId)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 50);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transfer Market</CardTitle>
          <div className="text-sm font-bold text-green-600">Budget: £{userClub?.balance.toLocaleString()}</div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transferList.map((player) => {
              const playerClub = clubs.find(c => c.id === player.clubId);
              return (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.firstName} {player.lastName}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{playerClub?.name}</TableCell>
                  <TableCell>{player.overallRating.toFixed(0)}</TableCell>
                  <TableCell>£{player.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      disabled={(userClub?.balance || 0) < player.value}
                      onClick={() => buyPlayer(player.id)}
                    >
                      Buy
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransferMarket;

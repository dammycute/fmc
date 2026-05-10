import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { clubs, userClubId, currentWeek, currentSeason, advanceWeek, matches } = useGameStore();
  const userClub = clubs.find((c) => c.id === userClubId);

  if (!userClub) return <div>Loading...</div>;

  const recentMatches = matches
    .filter((m) => m.homeClubId === userClubId || m.awayClubId === userClubId)
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4" style={{ borderTopColor: userClub.primaryColor }}>
          <CardHeader>
            <CardTitle>Club Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: userClub.primaryColor }}>{userClub.name}</div>
            <div className="text-sm font-semibold">{userClub.stadiumName}</div>
            <div className="text-sm text-muted-foreground">Season {currentSeason} | Week {currentWeek}</div>
            <div className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Philosophy: {userClub.philosophy}</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4" style={{ borderTopColor: userClub.primaryColor }}>
          <CardHeader>
            <CardTitle>Finances & Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">£{userClub.balance.toLocaleString()}</div>
            <div className="text-sm font-semibold">Reputation: {userClub.reputation.toFixed(1)}</div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Board Confidence</div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${userClub.boardConfidence}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: userClub.primaryColor }}>
          <CardHeader>
            <CardTitle>Fans & Stadium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userClub.fanbase.toLocaleString()}</div>
            <div className="text-sm font-semibold">Stadium: {userClub.stadiumCapacity.toLocaleString()}</div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Fan Confidence</div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${userClub.fanConfidence}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={advanceWeek} className="w-full md:w-64">
          Advance Week
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches.length === 0 && <p className="text-muted-foreground">No matches played yet.</p>}
            {recentMatches.map((match) => {
              const homeClub = clubs.find((c) => match.homeClubId === c.id);
              const awayClub = clubs.find((c) => match.awayClubId === c.id);
              const isHome = match.homeClubId === userClubId;
              const result = match.homeScore === match.awayScore ? 'D' : (isHome ? (match.homeScore > match.awayScore ? 'W' : 'L') : (match.awayScore > match.homeScore ? 'W' : 'L'));
              
              return (
                <div key={match.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="w-1/3 text-right">{homeClub?.name}</div>
                  <div className="w-1/3 text-center font-bold">
                    {match.homeScore} - {match.awayScore}
                    <span className={`ml-2 text-xs px-1 rounded ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                      {result}
                    </span>
                  </div>
                  <div className="w-1/3 text-left">{awayClub?.name}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

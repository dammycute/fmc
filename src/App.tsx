import React from 'react';
import { useGameStore } from './store/useGameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from './components/screens/Dashboard';
import Squad from './components/screens/Squad';
import Standings from './components/screens/Standings';
import TransferMarket from './components/screens/TransferMarket';
import { Button } from '@/components/ui/button';

const App: React.FC = () => {
  const { userClubId, initializeGame, resetGame, currentWeek } = useGameStore();

  if (!userClubId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-4xl font-bold">Football Chairman Clone</h1>
        <p className="text-muted-foreground">Start your journey as a football club chairman.</p>
        <Button size="lg" onClick={initializeGame}>New Game</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Football Chairman</h1>
        <Button variant="outline" size="sm" onClick={resetGame}>Reset Game</Button>
      </header>

      <Tabs defaultValue="dashboard" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>
        <TabsContent value="squad">
          <Squad />
        </TabsContent>
        <TabsContent value="standings">
          <Standings />
        </TabsContent>
        <TabsContent value="transfers">
          <TransferMarket />
        </TabsContent>
      </Tabs>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        Week {currentWeek} | Football Chairman Clone
      </footer>
    </div>
  );
};

export default App;

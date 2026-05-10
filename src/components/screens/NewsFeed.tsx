import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Newspaper, TrendingUp, AlertCircle, 
  Trophy, UserPlus, Globe, Clock 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NewsFeed: React.FC = () => {
  const { news } = useGameStore();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MATCH': return <Trophy className="w-4 h-4" />;
      case 'TRANSFER': return <UserPlus className="w-4 h-4" />;
      case 'CLUB': return <AlertCircle className="w-4 h-4" />;
      case 'RUMOUR': return <TrendingUp className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  const getImportanceStyles = (importance: string) => {
    switch (importance) {
      case 'BREAKING': return 'border-rose-500/50 bg-rose-500/10 text-rose-500';
      case 'HIGH': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
      default: return 'border-white/10 bg-white/5 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Football Today</h1>
          <p className="text-zinc-500 font-medium mt-1">Live coverage of the global football landscape.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-xl">
          <Globe className="w-3 h-3 animate-pulse" /> LIVE UPDATES
        </div>
      </div>

      <div className="space-y-6">
        {news.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Newspaper className="w-16 h-16 text-zinc-900 mx-auto" />
            <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Waiting for world events...</p>
          </div>
        ) : (
          news.map((story) => (
            <Card key={story.id} className={cn(
              "bg-zinc-900 border-white/5 overflow-hidden transition-all hover:translate-x-1 duration-300",
              story.importance === 'BREAKING' && "border-l-4 border-l-rose-500 shadow-xl shadow-rose-500/5"
            )}>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      getImportanceStyles(story.importance)
                    )}>
                      {getCategoryIcon(story.category)}
                    </div>
                    <Badge className={cn("text-[9px] font-black uppercase tracking-widest", getImportanceStyles(story.importance))}>
                      {story.importance} {story.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {story.date}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className={cn(
                    "font-black tracking-tight leading-tight",
                    story.importance === 'BREAKING' ? "text-2xl text-white" : "text-xl text-zinc-200"
                  )}>
                    {story.title}
                  </h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    {story.content}
                  </p>
                </div>

                {story.importance === 'BREAKING' && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
                    <Button variant="ghost" className="h-8 text-[10px] font-black text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 px-0 uppercase tracking-widest">Read Full Analysis</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;

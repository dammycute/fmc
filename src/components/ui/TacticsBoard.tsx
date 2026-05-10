import React from 'react';
import { type Player, type Formation } from '../../types/game';
import { FORMATION_CONFIG, autoPickLineup } from '../../utils/dataGenerator';
import { cn } from '../../lib/utils';
import { Badge } from './badge';

interface TacticsBoardProps {
  formation: Formation;
  startingLineup: { [pos: string]: string | null };
  players: Player[];
  onPlayerClick?: (player: Player) => void;
  variant?: 'full' | 'mini';
}

const TacticsBoard: React.FC<TacticsBoardProps> = ({ 
  formation, 
  startingLineup, 
  players, 
  onPlayerClick,
  variant = 'full'
}) => {
  const config = FORMATION_CONFIG[formation];
  
  // Use a fallback lineup if the one provided is empty
  const hasLineup = startingLineup && Object.keys(startingLineup).length > 0;
  const effectiveLineup = React.useMemo(() => {
    return hasLineup ? startingLineup : autoPickLineup(formation, players);
  }, [formation, startingLineup, players, hasLineup]);

  return (
    <div className={cn(
      "relative w-full aspect-[2/3] bg-emerald-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group/pitch",
      variant === 'mini' && "rounded-xl border-2"
    )}>
      {/* Pitch Markings */}
      <div className={cn(
        "absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none",
        variant === 'mini' && "inset-2 border"
      )}>
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 -translate-y-1/2" />
        <div className={cn(
          "absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2",
          variant === 'mini' && "w-16 h-16 border"
        )} />
        
        {/* Penalty Areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/6 border-b-2 border-x-2 border-white/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/6 border-t-2 border-x-2 border-white/20" />
      </div>

      {/* Mowing Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.2) 20%)'
      }} />

      {/* Players */}
      {Object.entries(config).map(([posLabel, coords]) => {
        const playerId = effectiveLineup[posLabel];
        const player = players.find(p => p.id === playerId);
        
        return (
          <div 
            key={posLabel}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-500"
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
          >
            <div 
              onClick={() => player && onPlayerClick?.(player)}
              className={cn(
                "rounded-full flex items-center justify-center font-black shadow-lg border-2 transition-transform hover:scale-110 cursor-pointer",
                variant === 'full' ? "w-12 h-12 text-xs" : "w-7 h-7 text-[8px]",
                player 
                  ? "bg-indigo-600 border-white text-white" 
                  : "bg-zinc-800/50 border-white/20 text-zinc-600 border-dashed"
              )}
            >
              {player ? player.lastName.charAt(0) : '?'}
              {player && variant === 'full' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black shadow-md border border-indigo-100">
                  {Math.floor(player.overallRating)}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className={cn(
                "font-black text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap uppercase tracking-tighter",
                variant === 'full' ? "text-[9px]" : "text-[6px] px-1 py-0 px-0.5"
              )}>
                {player ? (variant === 'full' ? `${player.firstName.charAt(0)}. ${player.lastName}` : player.lastName) : ''}
              </span>
              {variant === 'full' && (
                <Badge className="bg-white/10 text-white/60 border-none text-[7px] h-3 px-1 mt-0.5 font-bold">
                  {posLabel}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TacticsBoard;

import React, { useEffect, useState, useRef } from 'react';
import { type Club, type Player, type MatchEvent, type Formation } from '../../types/game';
import { FORMATION_CONFIG, autoPickLineup } from '../../utils/dataGenerator';

interface Pitch2DProps {
    homeClub: Club | undefined;
    awayClub: Club | undefined;
    homePlayers: Player[];
    awayPlayers: Player[];
    minute: number;
    events: MatchEvent[];
    currentHomeScore: number;
    currentAwayScore: number;
    isFinished: boolean;
}

interface Pos { x: number; y: number; }

// Convert FORMATION_CONFIG portrait coords → landscape SVG coords
// Formation: x=0-100 (left-right), y=0-100 (top=attack, bottom=GK)
// Landscape pitch: home attacks RIGHT, away attacks LEFT
// For HOME: svg_x = (100 - y) / 100, svg_y = x / 100
// For AWAY: svg_x = y / 100, svg_y = 1 - x / 100

function getPlayerPositions(
    formation: Formation,
    players: Player[],
    startingLineup: { [pos: string]: string | null },
    isHome: boolean
): { player: Player | null; pos: Pos; posKey: string }[] {
    const config = FORMATION_CONFIG[formation];
    const hasLineup = startingLineup && Object.keys(startingLineup).length > 0;
    const effectiveLineup = (() => {
        if (!hasLineup) return autoPickLineup(formation, players);
        const allResolved = Object.values(startingLineup).every(
            id => !id || players.some(p => p.id === id)
        );
        return allResolved ? startingLineup : autoPickLineup(formation, players);
    })();

    return Object.entries(config).map(([posKey, data]) => {
        const playerId = effectiveLineup[posKey];
        const player = playerId ? players.find(p => p.id === playerId) ?? null : null;

        let nx: number, ny: number;
        if (isHome) {
            nx = (100 - data.y) / 100;
            ny = data.x / 100;
        } else {
            nx = data.y / 100;
            ny = 1 - data.x / 100;
        }
        return { player, pos: { x: nx, y: ny }, posKey };
    });
}

// SVG pitch constants
const W = 600;
const H = 380;
const M = 22; // margin
const PW = W - M * 2; // pitch width  556
const PH = H - M * 2; // pitch height 336

function px(nx: number) { return M + nx * PW; }
function py(ny: number) { return M + ny * PH; }

const Pitch2D: React.FC<Pitch2DProps> = ({
    homeClub, awayClub, homePlayers, awayPlayers,
    minute, events, currentHomeScore, currentAwayScore, isFinished
}) => {
    const [ballPos, setBallPos] = useState<Pos>({ x: 0.5, y: 0.5 });
    const [goalFlash, setGoalFlash] = useState<'home' | 'away' | null>(null);
    const [flashMsg, setFlashMsg] = useState<string | null>(null);
    const [possession, setPossession] = useState<'home' | 'away'>('home');
    const ballRef = useRef<SVGCircleElement>(null);
    const prevMinute = useRef(0);

    // Possession flips
    useEffect(() => {
        const t = setInterval(() => {
            setPossession(Math.random() > 0.45 ? 'home' : 'away');
        }, 3500);
        return () => clearInterval(t);
    }, [isFinished]);

    // Ball wander
    useEffect(() => {
        if (isFinished) return;
        const moveBall = () => {
            const zone = possession === 'home' ? 0.62 : 0.38;
            const newX = Math.max(0.05, Math.min(0.95, zone + (Math.random() - 0.5) * 0.28));
            const newY = Math.max(0.08, Math.min(0.92, 0.5 + (Math.random() - 0.5) * 0.65));
            setBallPos({ x: newX, y: newY });
        };
        moveBall();
        const t = setInterval(moveBall, 1600);
        return () => clearInterval(t);
    }, [possession, isFinished]);

    // React to events
    useEffect(() => {
        if (minute === prevMinute.current) return;
        prevMinute.current = minute;
        const minuteEvents = events.filter(e => e.minute === minute);
        minuteEvents.forEach(e => {
            if (e.type === 'GOAL') {
                const scoringHome = e.clubId === homeClub?.id;
                const goalX = scoringHome ? 0.97 : 0.03;
                setBallPos({ x: goalX, y: 0.5 });
                setGoalFlash(scoringHome ? 'home' : 'away');
                setFlashMsg(`GOAL! ${scoringHome ? homeClub?.name : awayClub?.name}`);
                setTimeout(() => {
                    setBallPos({ x: 0.5, y: 0.5 });
                    setGoalFlash(null);
                    setFlashMsg(null);
                }, 2200);
            } else if (e.type === 'YELLOW' || e.type === 'RED' || e.type === 'CARD') {
                setFlashMsg(e.description);
                setTimeout(() => setFlashMsg(null), 2000);
            } else if (e.type === 'INJURY') {
                setFlashMsg(`⚠ ${e.description}`);
                setTimeout(() => setFlashMsg(null), 2000);
            } else if (e.type === 'SAVE') {
                setFlashMsg(`🧤 ${e.description}`);
                setTimeout(() => setFlashMsg(null), 1500);
            } else if (e.type === 'WOODWORK') {
                setFlashMsg(`💥 ${e.description}`);
                setTimeout(() => setFlashMsg(null), 1800);
            } else if (e.type === 'BIG_CHANCE') {
                setFlashMsg(`❌ ${e.description}`);
                setTimeout(() => setFlashMsg(null), 1500);
            } else if (e.type === 'SUBSTITUTION') {
                setFlashMsg(`🔄 ${e.description}`);
                setTimeout(() => setFlashMsg(null), 2000);
            }
        });
    }, [minute, events, homeClub, awayClub]);

    const homePositions = getPlayerPositions(
        (homeClub?.formation || '4-4-2') as Formation,
        homePlayers, homeClub?.startingLineup || {}, true
    );
    const awayPositions = getPlayerPositions(
        (awayClub?.formation || '4-4-2') as Formation,
        awayPlayers, awayClub?.startingLineup || {}, false
    );

    const bx = px(ballPos.x);
    const by = py(ballPos.y);

    const homeColor = homeClub?.primaryColor || '#6366f1';
    const awayColor = awayClub?.primaryColor || '#ef4444';
    const getLabel = (player: Player | null, posKey: string) => {
        if (!player) return posKey.substring(0, 2);
        const raw = (player as Player & { name?: string; firstName?: string; lastName?: string }).name || (player as Player & { firstName?: string; lastName?: string }).lastName || (player as Player & { firstName?: string; lastName?: string }).firstName || '';
        const token = raw.trim().split(/\s+/).filter(Boolean).pop();
        return (token || posKey).substring(0, 3).toUpperCase();
    };

    // Mowing stripes
    const stripes = Array.from({ length: 8 }, (_, i) => i);

    return (
        <div className="relative w-full select-none">
            {/* Goal flash overlay */}
            {goalFlash && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-20 pointer-events-none animate-in zoom-in-75 duration-300">
                    <div className="bg-emerald-500/90 text-white text-2xl font-black px-8 py-4 rounded-2xl shadow-2xl uppercase tracking-widest animate-bounce">
                        ⚽ {flashMsg}
                    </div>
                </div>
            )}
            {/* Non-goal event flash */}
            {flashMsg && !goalFlash && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-zinc-800/95 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                        {flashMsg}
                    </div>
                </div>
            )}

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: `${W}/${H}` }}
            >
                {/* Background */}
                <rect width={W} height={H} fill="#1a3a1a" rx="12" />

                {/* Mowing stripes */}
                {stripes.map(i => (
                    <rect
                        key={i}
                        x={M + (i * PW) / 8}
                        y={M}
                        width={PW / 8}
                        height={PH}
                        fill={i % 2 === 0 ? '#1e4020' : '#1a3a1a'}
                    />
                ))}

                {/* Pitch outline */}
                <rect x={M} y={M} width={PW} height={PH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

                {/* Centre line */}
                <line x1={W / 2} y1={M} x2={W / 2} y2={H - M} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

                {/* Centre circle */}
                <circle cx={W / 2} cy={H / 2} r={PH * 0.14} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <circle cx={W / 2} cy={H / 2} r={3} fill="rgba(255,255,255,0.5)" />

                {/* Left penalty area */}
                {(() => {
                    const boxW = PW * 0.145;
                    const boxH = PH * 0.52;
                    const boxY = M + (PH - boxH) / 2;
                    return <rect x={M} y={boxY} width={boxW} height={boxH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />;
                })()}
                {/* Left 6-yard box */}
                {(() => {
                    const boxW = PW * 0.055;
                    const boxH = PH * 0.28;
                    const boxY = M + (PH - boxH) / 2;
                    return <rect x={M} y={boxY} width={boxW} height={boxH} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
                })()}
                {/* Left goal */}
                {(() => {
                    const goalH = PH * 0.16;
                    const goalY = M + (PH - goalH) / 2;
                    const flash = goalFlash === 'away';
                    return (
                        <>
                            <rect x={M - 14} y={goalY} width={14} height={goalH}
                                fill={flash ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.08)'}
                                stroke="rgba(255,255,255,0.4)" strokeWidth="2" rx="2"
                            />
                            {flash && <rect x={M - 14} y={goalY} width={14} height={goalH} fill="rgba(16,185,129,0.4)" rx="2">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="0.4s" repeatCount="5" />
                            </rect>}
                        </>
                    );
                })()}

                {/* Right penalty area */}
                {(() => {
                    const boxW = PW * 0.145;
                    const boxH = PH * 0.52;
                    const boxY = M + (PH - boxH) / 2;
                    return <rect x={W - M - boxW} y={boxY} width={boxW} height={boxH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />;
                })()}
                {/* Right 6-yard box */}
                {(() => {
                    const boxW = PW * 0.055;
                    const boxH = PH * 0.28;
                    const boxY = M + (PH - boxH) / 2;
                    return <rect x={W - M - boxW} y={boxY} width={boxW} height={boxH} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
                })()}
                {/* Right goal */}
                {(() => {
                    const goalH = PH * 0.16;
                    const goalY = M + (PH - goalH) / 2;
                    const flash = goalFlash === 'home';
                    return (
                        <>
                            <rect x={W - M} y={goalY} width={14} height={goalH}
                                fill={flash ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.08)'}
                                stroke="rgba(255,255,255,0.4)" strokeWidth="2" rx="2"
                            />
                            {flash && <rect x={W - M} y={goalY} width={14} height={goalH} fill="rgba(16,185,129,0.4)" rx="2">
                                <animate attributeName="opacity" values="0.4;1;0.4" dur="0.4s" repeatCount="5" />
                            </rect>}
                        </>
                    );
                })()}

                {/* Corner arcs */}
                {[
                    { cx: M, cy: M, start: 0, end: 90 },
                    { cx: W - M, cy: M, start: 90, end: 180 },
                    { cx: W - M, cy: H - M, start: 180, end: 270 },
                    { cx: M, cy: H - M, start: 270, end: 360 },
                ].map(({ cx, cy, start }, i) => {
                    const r = 10;
                    const a1 = (start * Math.PI) / 180;
                    const a2 = ((start + 90) * Math.PI) / 180;
                    return (
                        <path key={i}
                            d={`M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`}
                            fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                        />
                    );
                })}

                {/* Possession bar at top */}
                <rect x={M} y={6} width={PW} height={5} fill="rgba(255,255,255,0.06)" rx="3" />
                <rect x={M} y={6} width={PW * (possession === 'home' ? 0.6 : 0.4)} height={5}
                    fill={homeColor} rx="3" style={{ transition: 'width 1.5s ease' }} />

                {/* Home team label */}
                <text x={M + 4} y={13} fill={homeColor} fontSize="8" fontWeight="700" fontFamily="system-ui" opacity="0.9">
                    {homeClub?.name.substring(0, 12).toUpperCase()}
                </text>
                {/* Away team label */}
                <text x={W - M - 4} y={13} fill={awayColor} fontSize="8" fontWeight="700" fontFamily="system-ui" opacity="0.9" textAnchor="end">
                    {awayClub?.name.substring(0, 12).toUpperCase()}
                </text>

                {/* Away team players */}
                {awayPositions.map(({ player, pos, posKey }) => {
                    const cx = px(pos.x);
                    const cy = py(pos.y);
                    return (
                        <g key={`away-${posKey}`} style={{ transition: 'transform 0.4s ease' }}>
                            <circle cx={cx} cy={cy} r={11} fill={awayColor} opacity="0.15" />
                            <circle cx={cx} cy={cy} r={8} fill={awayColor} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="6" fontWeight="900" fill="white" fontFamily="system-ui">
                                {getLabel(player, posKey)}
                            </text>
                        </g>
                    );
                })}

                {/* Home team players */}
                {homePositions.map(({ player, pos, posKey }) => {
                    const cx = px(pos.x);
                    const cy = py(pos.y);
                    return (
                        <g key={`home-${posKey}`} style={{ transition: 'transform 0.4s ease' }}>
                            <circle cx={cx} cy={cy} r={11} fill={homeColor} opacity="0.15" />
                            <circle cx={cx} cy={cy} r={8} fill={homeColor} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="6" fontWeight="900" fill="white" fontFamily="system-ui">
                                {getLabel(player, posKey)}
                            </text>
                        </g>
                    );
                })}

                {/* Ball shadow */}
                <ellipse
                    cx={bx} cy={by + 4}
                    rx={7} ry={3}
                    fill="rgba(0,0,0,0.4)"
                    style={{ transition: 'cx 0.9s cubic-bezier(0.4,0,0.2,1), cy 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                />
                {/* Ball */}
                <circle
                    ref={ballRef}
                    cx={bx} cy={by}
                    r={7}
                    fill="white"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="1"
                    style={{ transition: 'cx 0.9s cubic-bezier(0.4,0,0.2,1), cy 0.9s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                />
                {/* Ball pentagon pattern */}
                <circle
                    cx={bx} cy={by}
                    r={3}
                    fill="rgba(0,0,0,0.2)"
                    style={{ transition: 'cx 0.9s cubic-bezier(0.4,0,0.2,1), cy 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                />

                {/* Minute overlay */}
                <rect x={W / 2 - 22} y={H - M - 16} width={44} height={14} fill="rgba(0,0,0,0.5)" rx="4" />
                <text x={W / 2} y={H - M - 6} textAnchor="middle" fontSize="8" fontWeight="900" fill="white" fontFamily="monospace" opacity="0.9">
                    {isFinished ? 'FT' : `${minute}'`}
                </text>
            </svg>

            {/* Score + team names bar below pitch */}
            <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor }} />
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{homeClub?.name}</span>
                    <span className="text-lg font-black text-white">{currentHomeScore}</span>
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {possession === 'home' ? '← attacking' : 'attacking →'}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{currentAwayScore}</span>
                    <span className="text-xs font-bold text-white truncate max-w-[120px] text-right">{awayClub?.name}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor }} />
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor }} />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Home</span>
                </div>
                <div className="w-4 h-px bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor }} />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Away</span>
                </div>
            </div>
        </div>
    );
};

export default Pitch2D;
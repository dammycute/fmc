import { useState, useEffect, useCallback } from 'react';

export interface MatchEvent {
  minute: number;
  type: string;
  description: string;
  home_score: number;
  away_score: number;
  club_id: number;
  player_id: number;
}

export function useMatchWebSocket() {
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);

  const clearMatchEvents = useCallback(() => {
    setMatchEvents([]);
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/match/';
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'match.event') {
          setMatchEvents((prev) => [...prev, data]);
        }
      };

      socket.onclose = () => {
        console.log('Match WebSocket closed. Reconnecting...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('Match WebSocket error:', err);
        socket?.close();
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return { matchEvents, clearMatchEvents };
}

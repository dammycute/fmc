const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const key = `${options.method || 'GET'}:${url}`;

    // Request deduplication for GET
    if ((options.method === 'GET' || !options.method) && this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key);
    }

    const promise = fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }).then(async (res) => {
      this.inFlightRequests.delete(key);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data.error || 'An unexpected error occurred');
        (error as any).code = data.code || 'UNKNOWN_ERROR';
        throw error;
      }
      return data as T;
    });

    if (options.method === 'GET' || !options.method) {
      this.inFlightRequests.set(key, promise);
    }

    return promise;
  }

  // Game State
  getGameState = () => this.request<any>('/game-state/');
  buyClub = (club_id: string, new_name?: string) =>
    this.request<any>('/game-state/buy-club/', { method: 'POST', body: JSON.stringify({ club_id, new_name }) });
  advanceWeek = () => this.request<any>('/advance-week/', { method: 'POST' });

  // Clubs
  getClubs = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/clubs/?${query}`);
  };
  getClub = (id: string) => this.request<any>(`/clubs/${id}/`);
  updateClub = (id: string, data: any) => this.request<any>(`/clubs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  upgradeFacility = (id: string, type: string) =>
    this.request<any>(`/clubs/${id}/upgrade-facility/`, { method: 'POST', body: JSON.stringify({ type }) });
  acceptSponsor = (id: string, sponsor_id: string) =>
    this.request<any>(`/clubs/${id}/accept-sponsor/`, { method: 'POST', body: JSON.stringify({ sponsor_id }) });

  // Players
  getPlayers = (params: any) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/players/?${query}`);
  };
  getPlayer = (id: string) => this.request<any>(`/players/${id}/`);
  updatePlayer = (id: string, data: any) => this.request<any>(`/players/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

  // Managers
  getManagers = (unattached?: boolean) => this.request<any>(`/managers/${unattached ? '?unattached=true' : ''}`);
  hireManager = (club_id: string, manager_id: string) =>
    this.request<any>(`/clubs/${club_id}/hire-manager/`, { method: 'POST', body: JSON.stringify({ manager_id }) });
  sackManager = (id: string) => this.request<any>(`/managers/${id}/sack/`, { method: 'POST' });

  // Staff
  getStaff = (params: any) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/staff/?${query}`);
  };
  hireStaff = (club_id: string, staff_id: string) =>
    this.request<any>(`/clubs/${club_id}/hire-staff/`, { method: 'POST', body: JSON.stringify({ staff_id }) });
  dismissStaff = (id: string) => this.request<any>(`/staff/${id}/dismiss/`, { method: 'DELETE' });

  // Matches
  getMatches = (params: any) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/matches/?${query}`);
  };
  getMatch = (id: string) => this.request<any>(`/matches/${id}/`);
  simulateMatch = (id: string) => this.request<any>(`/matches/${id}/simulate/`, { method: 'POST' });
  finalizeMatch = (id: string, data: any) => this.request<any>(`/matches/${id}/finalize/`, { method: 'POST', body: JSON.stringify(data) });

  // Leagues
  getLeagues = () => this.request<any>('/leagues/');
  getLeagueTable = (id: string) => this.request<any>(`/leagues/${id}/table/`);

  // Transfers
  getTransferBids = (club_id?: string) => this.request<any>(`/transfer-bids/${club_id ? `?club_id=${club_id}` : ''}`);
  createTransferBid = (data: any) => this.request<any>('/transfer-bids/', { method: 'POST', body: JSON.stringify(data) });
  updateTransferBid = (id: string, data: any) => this.request<any>(`/transfer-bids/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  finalizeTransfer = (id: string) => this.request<any>(`/transfer-bids/${id}/finalize/`, { method: 'POST' });

  getTransferRequests = (club_id?: string) => this.request<any>(`/transfer-requests/${club_id ? `?club_id=${club_id}` : ''}`);
  updateTransferRequest = (id: string, data: any) => this.request<any>(`/transfer-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

  // News
  getNews = (params: any) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/news/?${query}`);
  };

  // Scouting
  getScoutAssignments = (club_id?: string) => this.request<any>(`/scout-assignments/${club_id ? `?club_id=${club_id}` : ''}`);
  createScoutAssignment = (data: any) => this.request<any>('/scout-assignments/', { method: 'POST', body: JSON.stringify(data) });
  deleteScoutAssignment = (id: string) => this.request<any>(`/scout-assignments/${id}/`, { method: 'DELETE' });

  // Shortlist
  getShortlist = () => this.request<any>('/shortlist/');
  addToShortlist = (id: string) => this.request<any>(`/shortlist/${id}/`, { method: 'POST' });
  removeFromShortlist = (id: string) => this.request<any>(`/shortlist/${id}/`, { method: 'DELETE' });
}

export const client = new ApiClient();

if (typeof window !== 'undefined') {
  (window as any).apiClient = client;
}

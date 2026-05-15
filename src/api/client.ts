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
  resetCareer = () => this.request<any>('/game-state/reset-career/', { method: 'POST' });
  advanceWeek = () => this.request<any>('/advance-week/', { method: 'POST' });
  skipWeeks = (weeks: number) => this.request<any>(`/advance-week/skip/?weeks=${weeks}`, { method: 'POST' });

  // Clubs
  getClubs = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/clubs/${query ? `?${query}` : ''}`);
  };
  getClub = (id: string) => this.request<any>(`/clubs/${id}/`);
  updateClub = (id: string, data: any) => this.request<any>(`/clubs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  upgradeFacility = (id: string, type: string) =>
    this.request<any>(`/clubs/${id}/upgrade-facility/`, { method: 'POST', body: JSON.stringify({ type }) });
  acceptSponsor = (id: string, sponsor_id: string) =>
    this.request<any>(`/clubs/${id}/accept-sponsor/`, { method: 'POST', body: JSON.stringify({ sponsor_id }) });

  // Players
  getPlayers = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/players/${query ? `?${query}` : ''}`);
  };
  getPlayer = (id: string) => this.request<any>(`/players/${id}/`);
  updatePlayer = (id: string, data: any) => this.request<any>(`/players/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

  // Managers
  getManagers = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/managers/${query ? `?${query}` : ''}`);
  };
  hireManager = (club_id: string, manager_id: string) =>
    this.request<any>(`/clubs/${club_id}/hire-manager/`, { method: 'POST', body: JSON.stringify({ manager_id }) });
  sackManager = (id: string) => this.request<any>(`/managers/${id}/sack/`, { method: 'POST' });

  // Staff
  getStaff = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/staff/${query ? `?${query}` : ''}`);
  };
  hireStaff = (club_id: string, staff_id: string) =>
    this.request<any>(`/clubs/${club_id}/hire-staff/`, { method: 'POST', body: JSON.stringify({ staff_id }) });
  dismissStaff = (id: string) => this.request<any>(`/staff/${id}/dismiss/`, { method: 'DELETE' });

  // Matches
  getMatches = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/matches/${query ? `?${query}` : ''}`);
  };
  getMatch = (id: string) => this.request<any>(`/matches/${id}/`);
  simulateMatch = (id: string) => this.request<any>(`/matches/${id}/simulate/`, { method: 'POST' });
  finalizeMatch = (id: string, data: any) => this.request<any>(`/matches/${id}/finalize/`, { method: 'POST', body: JSON.stringify(data) });

  // Leagues
  getLeagues = () => this.request<any>('/leagues/');
  getLeagueTable = (id: string) => this.request<any>(`/leagues/${id}/table/`);

  // Transfers
  getTransferBids = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/transfer-bids/${query ? `?${query}` : ''}`);
  };
  makeTransferBid = (data: any) => this.request<any>('/transfer-bids/make-bid/', { method: 'POST', body: JSON.stringify(data) });
  createTransferBid = (data: any) => this.makeTransferBid(data);
  updateTransferBid = (id: string, data: any) => this.request<any>(`/transfer-bids/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  acceptTransferBid = (id: string) => this.request<any>(`/transfer-bids/${id}/accept/`, { method: 'POST' });
  rejectTransferBid = (id: string) => this.request<any>(`/transfer-bids/${id}/reject/`, { method: 'POST' });
  counterTransferBid = (id: string, counter_amount: number) =>
    this.request<any>(`/transfer-bids/${id}/counter/`, { method: 'POST', body: JSON.stringify({ counter_amount }) });
  finalizeTransfer = (id: string) => this.request<any>(`/transfer-bids/${id}/finalize/`, { method: 'POST' });

  getTransferRequests = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/transfer-requests/${query ? `?${query}` : ''}`);
  };
  updateTransferRequest = (id: string, data: any) => this.request<any>(`/transfer-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });

  // News
  getNews = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/news/${query ? `?${query}` : ''}`);
  };

  // Scouting
  getScoutAssignments = (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/scout-assignments/${query ? `?${query}` : ''}`);
  };
  createScoutAssignment = (data: any) => this.request<any>('/scout-assignments/', { method: 'POST', body: JSON.stringify(data) });
  deleteScoutAssignment = (id: string) => this.request<any>(`/scout-assignments/${id}/`, { method: 'DELETE' });

  // Shortlist
  getShortlist = () => this.request<any>('/shortlist/');
  addToShortlist = (id: string) => this.request<any>(`/shortlist/${id}/`, { method: 'POST' });
  removeFromShortlist = (id: string) => this.request<any>(`/shortlist/${id}/`, { method: 'DELETE' });
}

export const client = new ApiClient();

# Football Chairman Simulation

A comprehensive football management simulation game built with React 19 and Django 5.x.

## 🚀 Architecture

The project is split into two main parts:

### 🎨 Frontend (`/`)
- **Framework**: React 19, TypeScript, Vite
- **State Management**: Zustand (API-driven)
- **Styling**: Tailwind CSS 4.3, Shadcn UI
- **Key Features**: Real-time match simulation UI (WebSockets), club management dashboard, transfer market, and regional scouting.

### ⚙️ Backend (`/chairman/backend`)
- **Framework**: Django 5.1.4, Django REST Framework 3.15.2
- **Real-time**: Django Channels 4.0 (WebSockets) with Daphne
- **Database**: SQLite (managed with specific folder structures)
- **Engines**:
  - **Match Engine**: Sophisticated xG model with momentum, fatigue, and 5-minute block simulation.
  - **Scouting Engine**: Regional discovery system with imperfect player reports.
  - **Transfer Engine**: AI-driven bidding, multi-cycle negotiations, and player unrest mechanics.
  - **Week Engine**: Central 10-step orchestrator for atomic game progression.
  - **Finance Engine**: Realistic economic model for TV rights, matchdays, and crisis handling.
  - **World Generator**: Seeds 100+ clubs and 1,500+ players across 5 English tiers.

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS)
- Python 3.12+

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd chairman/backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   python manage.py migrate
   ```
4. Seed the world:
   ```bash
   python manage.py seed_world
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. From the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play
- **Onboarding**: Select a club from the 5-tier English pyramid.
- **Matchday**: Prepare your lineup and tactics, then watch the simulation unfold with real-time xG and events.
- **Management**: Upgrade your stadium, sign sponsors, and manage your squad's morale and fitness.
- **Progression**: Advance through 38 weeks of the season, competing for promotion or fighting relegation.

## 🔍 Development Tools
- **Reset World**: `python manage.py reset_world` (clears and re-seeds all data)
- **Generate Fixtures**: `python manage.py generate_fixtures --season 2024`
- **Django Admin**: Access `/admin` to debug simulation state, player ratings, and club finances.

## 📝 Project Nitpicks & Technical Debt

This project is a single-user simulation designed for a desktop-like experience. As such, certain architectural shortcuts have been taken:

1. **Hardcoded User ID**: The WebSocket and Broadcaster currently target `user_id=1` and group `match_simulation_1` exclusively.
2. **In-Memory Channel Layer**: The project uses `InMemoryChannelLayer` for WebSockets. This is efficient for local play but will not scale to multi-server environments without Redis.
3. **Synchronous Core**: The simulation engines (Match, Finance, etc.) are purely synchronous. Real-time updates are achieved via `async_to_sync` bridges during the weekly tick.
4. **Statistics Persistence**: Match stats (goals/assists) are updated atomically via `F()` expressions, but season-long history aggregation is currently handled on-the-fly rather than through dedicated historical models.
5. **Position Weighting**: The "Overall Rating" calculation is position-weighted but static. Changing a player's position does not currently recalculate their attributes, only their displayed rating.
6. **Frontend Sync**: The frontend re-fetches the entire game state after most actions (`advance_week`, `finalize_transfer`) rather than performing granular state diffing.
7. **Test Coverage**: While core engines have standalone verification scripts, formal Django/Pytest suites are currently minimal.
8. **Scouting Pools**: The regional scouting system currently has empty nationality pools for Asia and North America, as the `world_generator.py` focuses on Europe, Africa, and South America.
9. **Event Granularity**: The real-time WebSocket ticker currently broadcasts only high-impact events (Goals, Cards). Lower-level match commentary is available in the final match summary but not streamed live.
10. **Manager Economy**: Managers receive salaries which are deducted from club balances, but there is currently no personal financial system for AI managers or the user-chairman.

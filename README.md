# Football Chairman Simulation

A comprehensive football management simulation game built with React 19 and Django 5.x.

## 🚀 Architecture

The project is split into two main parts:

### 🎨 Frontend (`/`)
- **Framework**: React 19, TypeScript, Vite
- **State Management**: Zustand (API-driven)
- **Styling**: Tailwind CSS 4.3, Shadcn UI
- **Key Features**: Real-time match simulation UI, club management dashboard, and transfer market.

### ⚙️ Backend (`/chairman/backend`)
- **Framework**: Django 5.1.4, Django REST Framework 3.15.2
- **Database**: SQLite (managed with specific folder structures)
- **Engines**:
  - **Match Engine**: Sophisticated xG model with momentum and fatigue.
  - **Week Engine**: Central orchestrator for weekly game progression.
  - **World Generator**: Seeds 100+ clubs and 1,500+ players across 5 English tiers.
  - **Finance Engine**: Realistic economic model for TV rights, matchdays, and wages.

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

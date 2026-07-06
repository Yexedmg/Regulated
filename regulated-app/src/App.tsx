import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DysregulationEvent, DayLog, Fix, Page } from './types';
import { EventsPage } from './pages/EventsPage';
import { LogPage } from './pages/LogPage';
import { TrendsPage } from './pages/TrendsPage';
import { FixPage } from './pages/FixPage';
import './App.css';

function App() {
  const [page, setPage] = useState<Page>('log');
  const [events, setEvents] = useLocalStorage<DysregulationEvent[]>('dysreg-events', []);
  const [logs, setLogs] = useLocalStorage<DayLog[]>('dysreg-logs', []);
  const [fixes, setFixes] = useLocalStorage<Fix[]>('dysreg-fixes', []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Regulated</h1>
        <p className="app-subtitle">Track your dysregulation patterns</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${page === 'events' ? 'nav-active' : ''}`}
          onClick={() => setPage('events')}
        >
          Events
        </button>
        <button
          className={`nav-btn ${page === 'log' ? 'nav-active' : ''}`}
          onClick={() => setPage('log')}
        >
          Log Day
        </button>
        <button
          className={`nav-btn ${page === 'trends' ? 'nav-active' : ''}`}
          onClick={() => setPage('trends')}
        >
          Trends
        </button>
        <button
          className={`nav-btn ${page === 'fix' ? 'nav-active' : ''}`}
          onClick={() => setPage('fix')}
        >
          Fix
        </button>
      </nav>

      <main className="app-main">
        {page === 'events' && <EventsPage events={events} setEvents={setEvents} />}
        {page === 'log' && <LogPage events={events} logs={logs} setLogs={setLogs} />}
        {page === 'trends' && <TrendsPage events={events} logs={logs} />}
        {page === 'fix' && <FixPage fixes={fixes} setFixes={setFixes} />}
      </main>
    </div>
  );
}

export default App;

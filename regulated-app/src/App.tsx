import { useState, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DysregulationEvent, RegulationEvent, DayLog, Page } from './types';
import { EventsPage } from './pages/EventsPage';
import { RegEventsPage } from './pages/RegEventsPage';
import { LogPage } from './pages/LogPage';
import { TrendsPage } from './pages/TrendsPage';
import './App.css';

interface AppData {
  events: DysregulationEvent[];
  regEvents: RegulationEvent[];
  logs: DayLog[];
}

function App() {
  const [page, setPage] = useState<Page>('log');
  const [events, setEvents] = useLocalStorage<DysregulationEvent[]>('dysreg-events', []);
  const [regEvents, setRegEvents] = useLocalStorage<RegulationEvent[]>('reg-events', []);
  const [logs, setLogs] = useLocalStorage<DayLog[]>('dysreg-logs', []);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: AppData = { events, regEvents, logs };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulated-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData;
        if (!Array.isArray(data.events) || !Array.isArray(data.logs)) {
          setImportMsg('Invalid file format.');
          return;
        }
        setEvents(data.events);
        setRegEvents(data.regEvents ?? []);
        setLogs(data.logs);
        setImportMsg('Data loaded successfully.');
      } catch {
        setImportMsg('Failed to read file.');
      }
      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Regulated</h1>
        <p className="app-subtitle">Track your dysregulation &amp; regulation patterns</p>
        <div className="data-actions">
          <button className="btn btn-small" onClick={handleExport}>Save Data</button>
          <button className="btn btn-small" onClick={() => fileInputRef.current?.click()}>Load Data</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            hidden
          />
        </div>
        {importMsg && <p className="import-msg">{importMsg}</p>}
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${page === 'events' ? 'nav-active' : ''}`}
          onClick={() => setPage('events')}
        >
          Dysregulation
        </button>
        <button
          className={`nav-btn nav-btn-reg ${page === 'reg-events' ? 'nav-active-reg' : ''}`}
          onClick={() => setPage('reg-events')}
        >
          Regulation
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
      </nav>

      <main className="app-main">
        {page === 'events' && <EventsPage events={events} setEvents={setEvents} logs={logs} />}
        {page === 'reg-events' && <RegEventsPage events={regEvents} setEvents={setRegEvents} logs={logs} />}
        {page === 'log' && <LogPage events={events} regEvents={regEvents} logs={logs} setLogs={setLogs} />}
        {page === 'trends' && <TrendsPage events={events} regEvents={regEvents} logs={logs} />}
      </main>
    </div>
  );
}

export default App;

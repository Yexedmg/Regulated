import { useState } from 'react';
import { format } from 'date-fns';
import type { DysregulationEvent, RegulationEvent, DayLog } from '../types';

interface Props {
  events: DysregulationEvent[];
  regEvents: RegulationEvent[];
  logs: DayLog[];
  setLogs: React.Dispatch<React.SetStateAction<DayLog[]>>;
}

export function LogPage({ events, regEvents, logs, setLogs }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(() => {
    const existing = logs.find(l => l.date === today);
    return existing ? existing.eventIds : [];
  });
  const [selectedRegEventIds, setSelectedRegEventIds] = useState<string[]>(() => {
    const existing = logs.find(l => l.date === today);
    return existing?.regEventIds ?? [];
  });
  const [notes, setNotes] = useState(() => {
    const existing = logs.find(l => l.date === today);
    return existing?.notes ?? '';
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existing = logs.find(l => l.date === date);
    setSelectedEventIds(existing ? existing.eventIds : []);
    setSelectedRegEventIds(existing?.regEventIds ?? []);
    setNotes(existing?.notes ?? '');
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleRegEvent = (eventId: string) => {
    setSelectedRegEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSave = () => {
    setLogs(prev => {
      const existing = prev.findIndex(l => l.date === selectedDate);
      const entry: DayLog = {
        id: existing >= 0 ? prev[existing].id : crypto.randomUUID(),
        date: selectedDate,
        eventIds: selectedEventIds,
        regEventIds: selectedRegEventIds,
        notes: notes.trim() || undefined,
      };
      if (existing >= 0) {
        return prev.map((l, i) => (i === existing ? entry : l));
      }
      return [...prev, entry];
    });
  };

  const dysregScore = selectedEventIds.reduce((sum, eid) => {
    const ev = events.find(e => e.id === eid);
    return sum + (ev?.effect ?? 0);
  }, 0);

  const regScore = selectedRegEventIds.reduce((sum, eid) => {
    const ev = regEvents.find(e => e.id === eid);
    return sum + (ev?.effect ?? 0);
  }, 0);

  const getDayScore = (log: DayLog): { dysreg: number; reg: number } => {
    const dysreg = log.eventIds.reduce((sum, eid) => {
      const ev = events.find(e => e.id === eid);
      return sum + (ev?.effect ?? 0);
    }, 0);
    const reg = (log.regEventIds ?? []).reduce((sum, eid) => {
      const ev = regEvents.find(e => e.id === eid);
      return sum + (ev?.effect ?? 0);
    }, 0);
    return { dysreg, reg };
  };

  const hasEvents = events.length > 0 || regEvents.length > 0;

  return (
    <div className="page">
      <h2>Log a Day</h2>
      <p className="page-description">
        Select the date and check which events occurred.
      </p>

      <div className="form-group">
        <label htmlFor="log-date">Date</label>
        <input
          id="log-date"
          type="date"
          value={selectedDate}
          onChange={e => handleDateChange(e.target.value)}
        />
      </div>

      {!hasEvents ? (
        <p className="empty-state">
          No events defined yet. Go to the Events pages to add some first.
        </p>
      ) : (
        <>
          <div className="day-scores">
            <div className="day-score">
              <span>Dysregulation:</span>
              <strong className={dysregScore > 0 ? 'score-active' : ''}>
                {dysregScore}
              </strong>
            </div>
            <div className="day-score day-score-reg">
              <span>Regulation:</span>
              <strong className={regScore > 0 ? 'score-reg-active' : ''}>
                {regScore}
              </strong>
            </div>
          </div>

          {events.length > 0 && (
            <>
              <h3 className="checklist-heading checklist-heading-dysreg">Dysregulation</h3>
              <div className="event-checklist">
                {events.map(event => (
                  <label key={event.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={selectedEventIds.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                    />
                    <span className="checklist-name">{event.name}</span>
                    <span className="checklist-effect">{event.effect}/10</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {regEvents.length > 0 && (
            <>
              <h3 className="checklist-heading checklist-heading-reg">Regulation</h3>
              <div className="event-checklist">
                {regEvents.map(event => (
                  <label key={event.id} className="checklist-item checklist-item-reg">
                    <input
                      type="checkbox"
                      checked={selectedRegEventIds.includes(event.id)}
                      onChange={() => toggleRegEvent(event.id)}
                    />
                    <span className="checklist-name">{event.name}</span>
                    <span className="checklist-effect">{event.effect}/10</span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="log-notes">Notes (optional)</label>
            <textarea
              id="log-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How was your day? Any additional context..."
              rows={3}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSave}>
            Save Day Log
          </button>
        </>
      )}

      {logs.length > 0 && (
        <div className="recent-logs">
          <h3>Recent Logs</h3>
          <ul className="log-list">
            {[...logs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map(log => {
                const scores = getDayScore(log);
                return (
                  <li
                    key={log.id}
                    className={`log-item ${log.date === selectedDate ? 'log-item-active' : ''}`}
                    onClick={() => handleDateChange(log.date)}
                  >
                    <span className="log-date">{log.date}</span>
                    <span className="log-score">
                      <span className="log-score-dysreg">{scores.dysreg}</span>
                      {' / '}
                      <span className="log-score-reg">{scores.reg}</span>
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}

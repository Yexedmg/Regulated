import { useState } from 'react';
import { format } from 'date-fns';
import type { DysregulationEvent, DayLog } from '../types';

interface Props {
  events: DysregulationEvent[];
  logs: DayLog[];
  setLogs: React.Dispatch<React.SetStateAction<DayLog[]>>;
}

export function LogPage({ events, logs, setLogs }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(() => {
    const existing = logs.find(l => l.date === today);
    return existing ? existing.eventIds : [];
  });
  const [notes, setNotes] = useState(() => {
    const existing = logs.find(l => l.date === today);
    return existing?.notes ?? '';
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existing = logs.find(l => l.date === date);
    setSelectedEventIds(existing ? existing.eventIds : []);
    setNotes(existing?.notes ?? '');
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEventIds(prev =>
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
        notes: notes.trim() || undefined,
      };
      if (existing >= 0) {
        return prev.map((l, i) => (i === existing ? entry : l));
      }
      return [...prev, entry];
    });
  };

  const getDayScore = (log: DayLog): number => {
    return log.eventIds.reduce((sum, eid) => {
      const ev = events.find(e => e.id === eid);
      return sum + (ev?.effect ?? 0);
    }, 0);
  };

  const currentScore = selectedEventIds.reduce((sum, eid) => {
    const ev = events.find(e => e.id === eid);
    return sum + (ev?.effect ?? 0);
  }, 0);

  const maxPossibleScore = events.reduce((sum, e) => sum + e.effect, 0);

  return (
    <div className="page">
      <h2>Log a Day</h2>
      <p className="page-description">
        Select the date and check which dysregulation events occurred.
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

      {events.length === 0 ? (
        <p className="empty-state">
          No events defined yet. Go to the Events page to add some first.
        </p>
      ) : (
        <>
          <div className="day-score">
            <span>Day dysregulation score:</span>
            <strong className={currentScore > 0 ? 'score-active' : ''}>
              {currentScore}{maxPossibleScore > 0 ? ` / ${maxPossibleScore}` : ''}
            </strong>
          </div>

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
              .map(log => (
                <li
                  key={log.id}
                  className={`log-item ${log.date === selectedDate ? 'log-item-active' : ''}`}
                  onClick={() => handleDateChange(log.date)}
                >
                  <span className="log-date">{log.date}</span>
                  <span className="log-events">
                    {log.eventIds.length} event{log.eventIds.length !== 1 ? 's' : ''}
                  </span>
                  <span className="log-score">Score: {getDayScore(log)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

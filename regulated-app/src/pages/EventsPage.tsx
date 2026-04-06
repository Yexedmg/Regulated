import { useState, useEffect, useMemo } from 'react';
import type { DysregulationEvent, DayLog } from '../types';

interface Props {
  events: DysregulationEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DysregulationEvent[]>>;
  logs: DayLog[];
}

function timeSince(dateStr: string, now: Date): string {
  const eventDate = new Date(dateStr + 'T23:59:59');
  const diffMs = now.getTime() - eventDate.getTime();
  if (diffMs < 0) return 'today';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  return parts.length > 0 ? parts.join(' ') + ' ago' : 'just now';
}

export function EventsPage({ events, setEvents, logs }: Props) {
  const [name, setName] = useState('');
  const [effect, setEffect] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Update "now" every minute so the timers stay current
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Map each event ID to its most recent log date
  const lastOccurrence = useMemo(() => {
    const map: Record<string, string> = {};
    for (const log of logs) {
      for (const eid of log.eventIds) {
        if (!map[eid] || log.date > map[eid]) {
          map[eid] = log.date;
        }
      }
    }
    return map;
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setEvents(prev =>
        prev.map(ev =>
          ev.id === editingId ? { ...ev, name: name.trim(), effect } : ev
        )
      );
      setEditingId(null);
    } else {
      setEvents(prev => [
        ...prev,
        { id: crypto.randomUUID(), name: name.trim(), effect },
      ]);
    }
    setName('');
    setEffect(5);
  };

  const handleEdit = (event: DysregulationEvent) => {
    setEditingId(event.id);
    setName(event.name);
    setEffect(event.effect);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setName('');
      setEffect(5);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setEffect(5);
  };

  return (
    <div className="page">
      <h2>Dysregulation Events</h2>
      <p className="page-description">
        These are events that happen in the day that cause dysregulation.
        Some dysregulate more than others. Add your events and rate their effect.
      </p>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="event-name">Event Name</label>
          <input
            id="event-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Cold exposure, Poor sleep..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="event-effect">
            Effect: <strong>{effect}/10</strong>
          </label>
          <input
            id="event-effect"
            type="range"
            min={0}
            max={10}
            value={effect}
            onChange={e => setEffect(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>0 (None)</span>
            <span>10 (Severe)</span>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update Event' : 'Add Event'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {events.length === 0 ? (
        <p className="empty-state">No events yet. Add your first dysregulation event above.</p>
      ) : (
        <ul className="event-list">
          {events.map(event => (
            <li key={event.id} className="event-item">
              <div className="event-info">
                <span className="event-name">{event.name}</span>
                <span className="event-effect">
                  <span className="effect-bar">
                    <span
                      className="effect-fill"
                      style={{ width: `${event.effect * 10}%` }}
                    />
                  </span>
                  {event.effect}/10
                </span>
                <span className="event-since">
                  {lastOccurrence[event.id]
                    ? timeSince(lastOccurrence[event.id], now)
                    : 'never logged'}
                </span>
              </div>
              <div className="event-actions">
                <button className="btn btn-small" onClick={() => handleEdit(event)}>
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

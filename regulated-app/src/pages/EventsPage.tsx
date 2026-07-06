import { useState } from 'react';
import type { DysregulationEvent } from '../types';

interface Props {
  events: DysregulationEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DysregulationEvent[]>>;
}

export function EventsPage({ events, setEvents }: Props) {
  const [name, setName] = useState('');
  const [effect, setEffect] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);

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

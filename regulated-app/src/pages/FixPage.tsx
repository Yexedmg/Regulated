import { useState } from 'react';
import { format } from 'date-fns';
import type { Fix } from '../types';

interface Props {
  fixes: Fix[];
  setFixes: React.Dispatch<React.SetStateAction<Fix[]>>;
}

export function FixPage({ fixes, setFixes }: Props) {
  const [text, setText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Most recent fix is the "current" one; the rest are history.
  const currentFix = fixes[0] ?? null;
  const history = fixes.slice(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setFixes(prev => [
      { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setText('');
  };

  const handleDelete = (id: string) => {
    setFixes(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="page">
      <h2>Current Fix</h2>
      <p className="page-description">
        A "fix" is the strategy or change you're currently trying to manage your
        dysregulation. Set a new current fix and the previous one is kept in your history.
      </p>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="fix-text">New Current Fix</label>
          <textarea
            id="fix-text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g., Morning walk + no caffeine after noon..."
            rows={3}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Set as Current Fix
          </button>
        </div>
      </form>

      {currentFix ? (
        <div className="current-fix">
          <span className="current-fix-badge">Current</span>
          <p className="current-fix-text">{currentFix.text}</p>
          <span className="current-fix-date">
            Since {format(new Date(currentFix.createdAt), 'MMM d, yyyy · h:mm a')}
          </span>
        </div>
      ) : (
        <p className="empty-state">No current fix set. Add your first one above.</p>
      )}

      {history.length > 0 && (
        <div className="fix-history">
          <button
            className="btn btn-secondary"
            onClick={() => setShowHistory(v => !v)}
          >
            {showHistory ? 'Hide History' : `View History (${history.length})`}
          </button>

          {showHistory && (
            <ul className="fix-history-list">
              {history.map(fix => (
                <li key={fix.id} className="fix-history-item">
                  <div className="fix-history-info">
                    <p className="fix-history-text">{fix.text}</p>
                    <span className="fix-history-date">
                      {format(new Date(fix.createdAt), 'MMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(fix.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

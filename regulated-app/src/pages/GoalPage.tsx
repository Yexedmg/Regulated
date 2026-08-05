import { useState, useEffect } from 'react';
import type { Goal } from '../types';

interface Props {
  goal: Goal | null;
  setGoal: React.Dispatch<React.SetStateAction<Goal | null>>;
  pastGoals: Goal[];
  setPastGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

function daysSince(dateStr: string, now: Date): number {
  const start = new Date(dateStr + 'T00:00:00');
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function timeSinceDetailed(dateStr: string, now: Date): string {
  const start = new Date(dateStr + 'T00:00:00');
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 'starts today';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  return parts.length > 0 ? parts.join(' ') : 'just now';
}

export function GoalPage({ goal, setGoal, pastGoals, setPastGoals }: Props) {
  const [text, setText] = useState('');
  const [targetDays, setTargetDays] = useState<string>('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      text: text.trim(),
      targetDays: targetDays ? Number(targetDays) : undefined,
      startDate: new Date().toISOString().slice(0, 10),
    };
    setGoal(newGoal);
    setText('');
    setTargetDays('');
  };

  const handleComplete = () => {
    if (!goal) return;
    const completed: Goal = {
      ...goal,
      completedDate: new Date().toISOString().slice(0, 10),
    };
    setPastGoals(prev => [completed, ...prev]);
    setGoal(null);
  };

  const handleAbandon = () => {
    setGoal(null);
  };

  const elapsed = goal ? daysSince(goal.startDate, now) : 0;
  const progress = goal?.targetDays ? Math.min((elapsed / goal.targetDays) * 100, 100) : null;

  return (
    <div className="page">
      <h2>Current Goal</h2>

      {goal ? (
        <div className="goal-card">
          <p className="goal-text">{goal.text}</p>

          <div className="goal-timer">
            <span className="goal-elapsed">{timeSinceDetailed(goal.startDate, now)}</span>
            <span className="goal-elapsed-label">elapsed</span>
          </div>

          {goal.targetDays && (
            <div className="goal-progress-section">
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="goal-progress-label">
                Day {elapsed} of {goal.targetDays}
                {elapsed >= goal.targetDays && ' — Target reached!'}
              </span>
            </div>
          )}

          <div className="goal-actions">
            <button className="btn btn-reg" onClick={handleComplete}>
              Complete
            </button>
            <button className="btn btn-secondary" onClick={handleAbandon}>
              Abandon
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="page-description">
            Set a goal to work towards. Track how long you've been at it.
          </p>
          <form onSubmit={handleSetGoal} className="event-form">
            <div className="form-group">
              <label htmlFor="goal-text">What's your goal?</label>
              <input
                id="goal-text"
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g., Go 21 days without dysregulation"
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-days">Target days (optional)</label>
              <input
                id="goal-days"
                type="number"
                min="1"
                value={targetDays}
                onChange={e => setTargetDays(e.target.value)}
                placeholder="e.g., 21"
                style={{ width: '120px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Set Goal
            </button>
          </form>
        </>
      )}

      {pastGoals.length > 0 && (
        <div className="past-goals">
          <h3>Past Goals</h3>
          <ul className="log-list">
            {pastGoals.map(g => (
              <li key={g.id} className="log-item past-goal-item">
                <div>
                  <span className="past-goal-text">{g.text}</span>
                  <span className="past-goal-dates">
                    {g.startDate} — {g.completedDate}
                    {g.targetDays && ` (target: ${g.targetDays}d)`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

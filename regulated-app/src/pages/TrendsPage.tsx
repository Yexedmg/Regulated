import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { DysregulationEvent, DayLog } from '../types';

interface Props {
  events: DysregulationEvent[];
  logs: DayLog[];
}

export function TrendsPage({ events, logs }: Props) {
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => a.date.localeCompare(b.date)),
    [logs]
  );

  const dailyScores = useMemo(() => {
    return sortedLogs.map(log => {
      const score = log.eventIds.reduce((sum, eid) => {
        const ev = events.find(e => e.id === eid);
        return sum + (ev?.effect ?? 0);
      }, 0);
      return {
        date: log.date,
        score,
        events: log.eventIds.length,
      };
    });
  }, [sortedLogs, events]);

  const eventFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const eid of log.eventIds) {
        counts[eid] = (counts[eid] ?? 0) + 1;
      }
    }
    return events
      .map(ev => ({
        name: ev.name,
        count: counts[ev.id] ?? 0,
        effect: ev.effect,
        totalImpact: (counts[ev.id] ?? 0) * ev.effect,
      }))
      .sort((a, b) => b.totalImpact - a.totalImpact);
  }, [events, logs]);

  const stats = useMemo(() => {
    if (dailyScores.length === 0) return null;

    const totalDays = dailyScores.length;
    const dysregulatedDays = dailyScores.filter(d => d.score > 0).length;
    const avgScore =
      dailyScores.reduce((sum, d) => sum + d.score, 0) / totalDays;
    const maxScore = Math.max(...dailyScores.map(d => d.score));

    // Calculate trend (compare first half vs second half)
    let trendPercent = 0;
    if (dailyScores.length >= 4) {
      const mid = Math.floor(dailyScores.length / 2);
      const firstHalf = dailyScores.slice(0, mid);
      const secondHalf = dailyScores.slice(mid);
      const firstAvg =
        firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((s, d) => s + d.score, 0) / secondHalf.length;
      if (firstAvg > 0) {
        trendPercent = ((secondAvg - firstAvg) / firstAvg) * 100;
      }
    }

    return { totalDays, dysregulatedDays, avgScore, maxScore, trendPercent };
  }, [dailyScores]);

  if (logs.length === 0) {
    return (
      <div className="page">
        <h2>Trends</h2>
        <p className="empty-state">
          No data yet. Start logging your days to see trends and statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Trends</h2>
      <p className="page-description">
        See how your dysregulation changes over time.
      </p>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalDays}</span>
            <span className="stat-label">Days Logged</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.dysregulatedDays}</span>
            <span className="stat-label">Days Dysregulated</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.avgScore.toFixed(1)}</span>
            <span className="stat-label">Avg. Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.maxScore}</span>
            <span className="stat-label">Peak Score</span>
          </div>
          <div className="stat-card stat-card-wide">
            <span
              className={`stat-value ${
                stats.trendPercent > 0
                  ? 'trend-up'
                  : stats.trendPercent < 0
                  ? 'trend-down'
                  : ''
              }`}
            >
              {stats.trendPercent > 0 ? 'Upward' : stats.trendPercent < 0 ? 'Downward' : 'Stable'}{' '}
              trend{stats.trendPercent !== 0 && ` by ${Math.abs(stats.trendPercent).toFixed(1)}%`}
            </span>
            <span className="stat-label">
              {stats.trendPercent > 0
                ? 'Dysregulation is increasing'
                : stats.trendPercent < 0
                ? 'Dysregulation is decreasing'
                : 'No significant change'}
            </span>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h3>Dysregulation Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyScores}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#999' }}
              tickFormatter={d => d.slice(5)}
            />
            <YAxis tick={{ fontSize: 12, fill: '#999' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#e74c3c"
              strokeWidth={2}
              dot={{ fill: '#e74c3c', r: 4 }}
              name="Dysregulation Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {eventFrequency.length > 0 && (
        <div className="chart-section">
          <h3>Impact by Event</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventFrequency} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12, fill: '#999' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="totalImpact" fill="#e74c3c" name="Total Impact" radius={[0, 4, 4, 0]} />
              <Bar dataKey="count" fill="#3498db" name="Occurrences" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

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
  Legend,
} from 'recharts';
import type { DysregulationEvent, RegulationEvent, DayLog } from '../types';

interface Props {
  events: DysregulationEvent[];
  regEvents: RegulationEvent[];
  logs: DayLog[];
}

export function TrendsPage({ events, regEvents, logs }: Props) {
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => a.date.localeCompare(b.date)),
    [logs]
  );

  const dailyScores = useMemo(() => {
    return sortedLogs.map(log => {
      const dysregScore = log.eventIds.reduce((sum, eid) => {
        const ev = events.find(e => e.id === eid);
        return sum + (ev?.effect ?? 0);
      }, 0);
      const regScore = (log.regEventIds ?? []).reduce((sum, eid) => {
        const ev = regEvents.find(e => e.id === eid);
        return sum + (ev?.effect ?? 0);
      }, 0);
      return {
        date: log.date,
        dysregulation: dysregScore,
        regulation: regScore,
      };
    });
  }, [sortedLogs, events, regEvents]);

  const dysregFrequency = useMemo(() => {
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
        totalImpact: (counts[ev.id] ?? 0) * ev.effect,
      }))
      .sort((a, b) => b.totalImpact - a.totalImpact);
  }, [events, logs]);

  const regFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const eid of (log.regEventIds ?? [])) {
        counts[eid] = (counts[eid] ?? 0) + 1;
      }
    }
    return regEvents
      .map(ev => ({
        name: ev.name,
        count: counts[ev.id] ?? 0,
        totalImpact: (counts[ev.id] ?? 0) * ev.effect,
      }))
      .sort((a, b) => b.totalImpact - a.totalImpact);
  }, [regEvents, logs]);

  const stats = useMemo(() => {
    if (dailyScores.length === 0) return null;

    const totalDays = dailyScores.length;
    const dysregulatedDays = dailyScores.filter(d => d.dysregulation > 0).length;
    const regulatedDays = dailyScores.filter(d => d.regulation > 0).length;
    const avgDysreg =
      dailyScores.reduce((sum, d) => sum + d.dysregulation, 0) / totalDays;
    const avgReg =
      dailyScores.reduce((sum, d) => sum + d.regulation, 0) / totalDays;

    let dysregTrend = 0;
    let regTrend = 0;
    if (dailyScores.length >= 4) {
      const mid = Math.floor(dailyScores.length / 2);
      const firstHalf = dailyScores.slice(0, mid);
      const secondHalf = dailyScores.slice(mid);
      const firstDysreg =
        firstHalf.reduce((s, d) => s + d.dysregulation, 0) / firstHalf.length;
      const secondDysreg =
        secondHalf.reduce((s, d) => s + d.dysregulation, 0) / secondHalf.length;
      const firstReg =
        firstHalf.reduce((s, d) => s + d.regulation, 0) / firstHalf.length;
      const secondReg =
        secondHalf.reduce((s, d) => s + d.regulation, 0) / secondHalf.length;
      if (firstDysreg > 0) {
        dysregTrend = ((secondDysreg - firstDysreg) / firstDysreg) * 100;
      }
      if (firstReg > 0) {
        regTrend = ((secondReg - firstReg) / firstReg) * 100;
      }
    }

    return { totalDays, dysregulatedDays, regulatedDays, avgDysreg, avgReg, dysregTrend, regTrend };
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

  const formatTrend = (percent: number, label: string) => {
    const dir = percent > 0 ? 'Upward' : percent < 0 ? 'Downward' : 'Stable';
    const suffix = percent !== 0 ? ` by ${Math.abs(percent).toFixed(1)}%` : '';
    return `${label}: ${dir} trend${suffix}`;
  };

  return (
    <div className="page">
      <h2>Trends</h2>
      <p className="page-description">
        See how your dysregulation and regulation change over time.
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
            <span className="stat-value">{stats.regulatedDays}</span>
            <span className="stat-label">Days Regulated</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              <span style={{ color: '#e74c3c' }}>{stats.avgDysreg.toFixed(1)}</span>
              {' / '}
              <span style={{ color: '#2ecc71' }}>{stats.avgReg.toFixed(1)}</span>
            </span>
            <span className="stat-label">Avg. Dysreg / Reg</span>
          </div>
          <div className="stat-card stat-card-wide">
            <span className={`stat-value ${stats.dysregTrend > 0 ? 'trend-up' : stats.dysregTrend < 0 ? 'trend-down' : ''}`}>
              {formatTrend(stats.dysregTrend, 'Dysregulation')}
            </span>
          </div>
          <div className="stat-card stat-card-wide">
            <span className={`stat-value ${stats.regTrend > 0 ? 'trend-down-reg' : stats.regTrend < 0 ? 'trend-up' : ''}`}>
              {formatTrend(stats.regTrend, 'Regulation')}
            </span>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h3>Scores Over Time</h3>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="dysregulation"
              stroke="#e74c3c"
              strokeWidth={2}
              dot={{ fill: '#e74c3c', r: 4 }}
              name="Dysregulation"
            />
            <Line
              type="monotone"
              dataKey="regulation"
              stroke="#2ecc71"
              strokeWidth={2}
              dot={{ fill: '#2ecc71', r: 4 }}
              name="Regulation"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dysregFrequency.length > 0 && (
        <div className="chart-section">
          <h3>Dysregulation Impact by Event</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, dysregFrequency.length * 40)}>
            <BarChart data={dysregFrequency} layout="vertical">
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

      {regFrequency.length > 0 && (
        <div className="chart-section">
          <h3>Regulation Impact by Event</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, regFrequency.length * 40)}>
            <BarChart data={regFrequency} layout="vertical">
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
              <Bar dataKey="totalImpact" fill="#2ecc71" name="Total Impact" radius={[0, 4, 4, 0]} />
              <Bar dataKey="count" fill="#3498db" name="Occurrences" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

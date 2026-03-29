import React, { useState, useEffect, useCallback } from 'react';
import './FocusDashboard.css';

const ambienceSounds = [
  { id: 'rain',  label: 'Rain',  icon: '🌧️' },
  { id: 'lofi',  label: 'Lo-Fi', icon: '🎵' },
  { id: 'noise', label: 'Noise', icon: '🌊' },
];

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function FocusDashboard({ onStartSession, refreshKey }) {
  const [activeAmbience, setActiveAmbience] = useState('lofi');
  const [volume, setVolume]                 = useState(60);
  const [focusIntent, setFocusIntent]       = useState('');
  const [animatedBars, setAnimatedBars]     = useState(false);
  const [animatedLine, setAnimatedLine]     = useState(false);
  const [stats, setStats]                   = useState(null);
  const [weeklyData, setWeeklyData]         = useState([]);
  const [trendData, setTrendData]           = useState([]);
  const [tasks, setTasks]                   = useState([]);
  const [selectedTask, setSelectedTask]     = useState('');
  const [loadingStats, setLoadingStats]     = useState(true);

  const token = localStorage.getItem('token');

  const fetchAll = useCallback(async () => {
    setLoadingStats(true);
    const authHeaders = { Authorization: `Bearer ${token}` };
    try {
      const [statsRes, trendRes, tasksRes] = await Promise.all([
        fetch('https://studyflow-xh1t.onrender.com/api/focus/stats', { headers: authHeaders }),
        fetch('https://studyflow-xh1t.onrender.com/api/focus/productivity-trend', { headers: authHeaders }),
        fetch('https://studyflow-xh1t.onrender.com/api/tasks/all', { headers: authHeaders }),
      ]);
      const [statsData, trendResult, tasksData] = await Promise.all([
        statsRes.json(),
        trendRes.json(),
        tasksRes.json(),
      ]);
      if (statsData.success) {
        setStats(statsData.stats);
        setWeeklyData(statsData.stats.weeklyData || []);
      }
      if (trendResult.success) setTrendData(trendResult.trend || []);
      if (Array.isArray(tasksData)) {
        setTasks(tasksData.filter(t => {
          const s = (t.status || '').toLowerCase();
          return s !== 'completed' && s !== 'done';
        }));
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoadingStats(false);
      setTimeout(() => setAnimatedBars(true), 200);
      setTimeout(() => setAnimatedLine(true), 400);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, refreshKey]);

  const maxHours     = weeklyData.length ? Math.max(...weeklyData.map(d => d.hours || 0), 0.1) : 1;
  const todayDayLabel = DAY_LABELS[new Date().getDay()];

  const svgW = 400, svgH = 80;
  const trendPoints = trendData.length >= 2
    ? trendData
    : Array.from({ length: 12 }, (_, i) => ({ avgEfficiency: 30 + i * 5 }));

  const pts = trendPoints.map((d, i) => {
    const x = (i / (trendPoints.length - 1)) * svgW;
    const y = svgH - ((d.avgEfficiency || 0) / 100) * svgH;
    return `${x},${y}`;
  });
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M 0,${svgH} L ${pts.join(' L ')} L ${svgW},${svgH} Z`;

  const handleQuickStart = () => {
    const task = tasks.find(t => (t._id || t.id) === selectedTask);
    onStartSession && onStartSession({
      focusIntent: focusIntent.trim() || task?.title || '',
      taskId: selectedTask || null,
      taskTitle: task?.title || null,
    });
  };

  const fmt = (val, fallback) => loadingStats ? '—' : (val ?? fallback);

  return (
    <div className="fd-container">

      {/* STATS ROW */}
      <div className="fd-stats-row">
        <StatCard
          label="Today's Focus Time"
          value={fmt(stats?.todayFocusTime?.formatted, '0m')}
          sub={stats?.todayFocusTime?.changePercent !== undefined
            ? `${stats.todayFocusTime.changePercent >= 0 ? '+' : ''}${stats.todayFocusTime.changePercent}% from yesterday`
            : 'No data yet'}
          subPositive={stats?.todayFocusTime?.changePercent > 0}
          loading={loadingStats}
        />
        <StatCard
          label="Current Streak"
          value={loadingStats ? '—' : <><span className="fd-fire">🔥</span> {stats?.currentStreak ?? 0} day{stats?.currentStreak !== 1 ? 's' : ''}</>}
          sub="Keep it going!"
          loading={loadingStats}
        />
        <StatCard
          label="Sessions Completed"
          value={fmt(stats?.sessionsCompleted?.today, '0')}
          sub="today"
          loading={loadingStats}
        />
        <StatCard
          label="Most Focused Task"
          value={fmt(stats?.mostFocusedTask?.name, 'None yet')}
          sub={stats?.mostFocusedTask ? stats.mostFocusedTask.formattedTime + ' avg' : 'Start a session!'}
          accent
          loading={loadingStats}
        />
      </div>

      {/* MIDDLE ROW */}
      <div className="fd-mid-row">
        <div className="fd-card fd-chart-card">
          <div className="fd-card-header">
            <div>
              <p className="fd-card-title">Weekly Focus Time</p>
              <p className="fd-card-sub">Consistency visualization</p>
            </div>
            <span className="fd-badge">Weekly</span>
          </div>
          <div className="fd-bar-chart">
            {weeklyData.length > 0 ? weeklyData.map(({ day, hours }) => {
              const isToday = day === todayDayLabel;
              const pct = Math.max((hours / maxHours) * 100, hours > 0 ? 4 : 0);
              return (
                <div key={day} className="fd-bar-col">
                  <div className="fd-bar-track">
                    <div
                      className={`fd-bar ${isToday ? 'fd-bar--today' : ''}`}
                      style={{ height: animatedBars ? `${pct}%` : '0%' }}
                      title={`${hours}h`}
                    />
                  </div>
                  <span className="fd-bar-label">{day}</span>
                </div>
              );
            }) : DAY_LABELS.map(day => (
              <div key={day} className="fd-bar-col">
                <div className="fd-bar-track">
                  <div className="fd-bar" style={{ height: '4px' }} />
                </div>
                <span className="fd-bar-label">{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fd-card fd-quickstart-card">
          <p className="fd-card-title">Quick Start</p>
          <div className="fd-field">
            <label className="fd-label">FOCUS INTENT</label>
            <input
              className="fd-input"
              placeholder="What are you focusing on?"
              value={focusIntent}
              onChange={e => setFocusIntent(e.target.value)}
            />
          </div>
          <div className="fd-field">
            <label className="fd-label">EXISTING TASK (OPTIONAL)</label>
            <div className="fd-select-wrap">
              <select className="fd-select" value={selectedTask} onChange={e => setSelectedTask(e.target.value)}>
                <option value="">Select task from task manager</option>
                {tasks.map(t => {
                  const id = t._id || t.id;
                  return <option key={id} value={id}>{t.title}</option>;
                })}
              </select>
              <span className="fd-select-arrow">▾</span>
            </div>
          </div>
          <button className="fd-start-btn" onClick={handleQuickStart}>
            <span className="fd-btn-dot" />
            Start Focus Session
          </button>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="fd-bot-row">
        <div className="fd-card fd-trend-card">
          <div className="fd-card-header">
            <div>
              <p className="fd-card-title">Productivity Trend</p>
              <p className="fd-card-sub">Deep work efficiency rating</p>
            </div>
          </div>
          <div className="fd-trend-svg-wrap">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" className="fd-trend-svg">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--fd-accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--fd-accent)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--fd-accent-muted)" />
                  <stop offset="100%" stopColor="var(--fd-accent)" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#trendGrad)" className={`fd-area ${animatedLine ? 'fd-area--show' : ''}`} />
              <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
                className={`fd-line ${animatedLine ? 'fd-line--show' : ''}`}
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="fd-card fd-ambience-card">
          <p className="fd-card-title">Focus Ambience</p>
          <div className="fd-ambience-btns">
            {ambienceSounds.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`fd-amb-btn ${activeAmbience === id ? 'fd-amb-btn--active' : ''}`}
                onClick={() => setActiveAmbience(id)}
              >
                <span className="fd-amb-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="fd-volume-row">
            <span className="fd-vol-icon">🔈</span>
            <input
              type="range" min="0" max="100"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="fd-slider"
              style={{ '--vol-pct': `${volume}%` }}
            />
            <span className="fd-vol-icon">🔊</span>
          </div>
          <p className="fd-vol-label">{volume}%</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, subPositive, accent, loading }) {
  return (
    <div className={`fd-card fd-stat-card ${accent ? 'fd-stat-card--accent' : ''} ${loading ? 'fd-stat-card--loading' : ''}`}>
      <p className="fd-stat-label">{label}</p>
      <p className="fd-stat-value">{value}</p>
      {sub && <p className={`fd-stat-sub ${subPositive ? 'fd-stat-sub--pos' : ''}`}>{sub}</p>}
    </div>
  );
}

export default FocusDashboard;
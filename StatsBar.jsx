import React, { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

const StatsBar = () => {
  const { stats, statsLoading, fetchStats } = useTaskContext();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (statsLoading || !stats) {
    return (
      <div className="stats-bar">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total', value: stats.total, class: 'stat-total', icon: '◈' },
    { label: 'To Do', value: stats.byStatus.todo, class: 'stat-todo', icon: '○' },
    { label: 'In Progress', value: stats.byStatus['in-progress'], class: 'stat-inprogress', icon: '●' },
    { label: 'Completed', value: stats.byStatus.completed, class: 'stat-completed', icon: '✓' },
  ];

  return (
    <div className="stats-bar">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${c.class}`}>
          <span className="stat-icon">{c.icon}</span>
          <span className="stat-value">{c.value}</span>
          <span className="stat-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;

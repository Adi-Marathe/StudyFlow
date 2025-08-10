import React from 'react';
import { CheckCircle, Clock, RotateCcw, CheckCheck } from 'lucide-react';
import './TaskStatsCards.css';

const TaskStatsCards = ({
  stats = { total: 0, todo: 0, inProgress: 0, done: 0 }
}) => {
  const format2 = (n) => String(n ?? 0).padStart(2, '0');

  const statsData = [
    {
      id: 1,
      number: format2(stats.total),
      label: 'Total Task',
      icon: CheckCircle,
      className: 'stats-card-purple'
    },
    {
      id: 2,
      number: format2(stats.todo),
      label: 'To Do',
      icon: Clock,
      className: 'stats-card-blue'
    },
    {
      id: 3,
      number: format2(stats.inProgress),
      label: 'In Progress',
      icon: RotateCcw,
      className: 'stats-card-pink'
    },
    {
      id: 4,
      number: format2(stats.done),
      label: 'Completed',
      icon: CheckCheck,
      className: 'stats-card-green'
    }
  ];

  return (
    <div className="stats-cards-container">
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.id} className={`stats-card ${stat.className}`}>
            <div className="stats-icon">
              <IconComponent size={16} />
            </div>
            <div className="stats-content">
              <div className="stats-number">{stat.number}</div>
              <div className="stats-label">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStatsCards;

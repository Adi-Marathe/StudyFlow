import React from 'react';
import { CheckCircle, Clock, RotateCcw, CheckCheck } from 'lucide-react';
import './TaskStatsCards.css';

const TaskStatsCards = () => {
  const statsData = [
    {
      id: 1,
      number: '1220',
      label: 'Total Task',
      icon: CheckCircle,
      className: 'stats-card-purple'
    },
    {
      id: 2,
      number: '07',
      label: 'To do',
      icon: Clock,
      className: 'stats-card-blue'
    },
    {
      id: 3,
      number: '43',
      label: 'In progress',
      icon: RotateCcw,
      className: 'stats-card-pink'
    },
    {
      id: 4,
      number: '1550',
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
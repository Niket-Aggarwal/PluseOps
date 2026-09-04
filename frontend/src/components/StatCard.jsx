import React from 'react';

const StatCard = ({ title, value, subtext, type = 'default', icon }) => {
  return (
    <div className={`stat-card stat-${type}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value ?? 0}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
};

export default StatCard;

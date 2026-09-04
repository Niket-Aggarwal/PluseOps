import React from 'react';

const StatusBadge = ({ status, size = 'normal' }) => {
  const normalized = (status || 'UNKNOWN').toUpperCase();
  
  let badgeClass = 'status-badge unknown';
  let label = 'UNKNOWN';

  if (normalized === 'UP') {
    badgeClass = 'status-badge up';
    label = 'UP';
  } else if (normalized === 'DOWN') {
    badgeClass = 'status-badge down';
    label = 'DOWN';
  }

  return (
    <span className={`${badgeClass} ${size === 'small' ? 'small' : ''}`}>
      <span className="dot" />
      <span className="label">● {label}</span>
    </span>
  );
};

export default StatusBadge;

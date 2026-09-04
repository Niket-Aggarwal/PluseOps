import React from 'react';

const Loading = ({ message = 'Loading PulseOps data...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;

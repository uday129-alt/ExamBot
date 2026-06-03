import React from 'react';

export default function GlassCard({ children, className = '', hoverEffect = true }) {
  return (
    <div
      className={`glass-panel p-6 rounded-2xl shadow-xl ${
        hoverEffect ? 'glass-panel-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

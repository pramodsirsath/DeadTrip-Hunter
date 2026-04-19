import React from 'react';

export default function GlassCard({ children, className = '', style = {}, animate = true, delay = 0 }) {
  return (
    <div
      className={`glass-card ${animate ? 'animate-fadeInUp' : ''} ${className}`}
      style={{
        padding: '24px',
        animationDelay: animate ? `${delay}s` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

import React from 'react';

export default function SkeletonLoader({ rows = 3, type = 'table' }) {
  if (type === 'cards') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-card skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton skeleton-title" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px' }}>
          <div className="skeleton skeleton-text" style={{ width: '30%' }} />
          <div className="skeleton skeleton-text" style={{ width: '50%' }} />
          <div className="skeleton skeleton-text" style={{ width: '20%' }} />
        </div>
      ))}
    </div>
  );
}

import React from 'react';

export default function StatCard({ icon, label, value, color = 'var(--accent-blue)', delay = 0 }) {
  return (
    <div
      className="glass-card animate-fadeInUp"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '2px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

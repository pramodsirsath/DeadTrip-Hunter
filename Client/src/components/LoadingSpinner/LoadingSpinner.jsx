import React from 'react';

export default function LoadingSpinner({ size = 40, text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px',
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid var(--bg-tertiary)',
        borderTopColor: 'var(--accent-blue)',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: '500',
        }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

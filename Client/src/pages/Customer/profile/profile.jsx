import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, LogOut } from 'lucide-react';
import PageTransition from '../../../components/PageTransition/PageTransition';
import GlassCard from '../../../components/GlassCard/GlassCard';

export default function CustomerProfile() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const profileFields = [
    { icon: <User size={20} />, label: 'Name', value: user.name, color: 'var(--accent-blue)' },
    { icon: <Mail size={20} />, label: 'Email', value: user.email, color: 'var(--accent-purple)' },
    { icon: <Phone size={20} />, label: 'Phone', value: user.phone, color: 'var(--accent-cyan)' },
    { icon: <Shield size={20} />, label: 'Role', value: user.role, color: 'var(--success)' },
  ];

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Avatar */}
          <div className="animate-scaleIn" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '2rem',
              fontWeight: '800',
              color: 'white',
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}>
              {user.name || 'Loading...'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Customer Account</p>
          </div>

          {/* Profile Card */}
          <GlassCard delay={0.15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profileFields.map((field, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    background: `${field.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: field.color,
                    flexShrink: 0,
                  }}>
                    {field.icon}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '2px',
                    }}>
                      {field.label}
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      textTransform: field.label === 'Role' ? 'capitalize' : 'none',
                    }}>
                      {field.value || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '12px',
                fontSize: '0.95rem',
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}

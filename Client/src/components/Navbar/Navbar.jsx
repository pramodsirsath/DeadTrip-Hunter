import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Truck, User, LogOut, LayoutDashboard, Package } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = isLoggedIn
    ? role === 'driver'
      ? [
          { to: '/driver/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/driver/profile', label: 'Profile', icon: <User size={18} /> },
        ]
      : [
          { to: '/customer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { to: '/post-ride', label: 'Post Ride', icon: <Package size={18} /> },
          { to: '/customer/profile', label: 'Profile', icon: <User size={18} /> },
        ]
    : [
        { to: '/login', label: 'Login', icon: null },
        { to: '/signup', label: 'Sign Up', icon: null },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-strong" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={isLoggedIn ? (role === 'driver' ? '/driver/dashboard' : '/customer/dashboard') : '/'} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Truck size={20} color="white" />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }} className="gradient-text">
            DeadTrip Hunter
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hide-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive(link.to) ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--info-soft)' : 'transparent',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button onClick={handleLogout} className="btn btn-ghost" style={{
              marginLeft: '8px',
              padding: '8px 14px',
              fontSize: '0.875rem',
            }}>
              <LogOut size={16} />
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="hide-desktop"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="hide-desktop animate-fadeInDown" style={{
          padding: '12px 24px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: isActive(link.to) ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--info-soft)' : 'transparent',
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button onClick={handleLogout} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--danger)',
              background: 'var(--danger-soft)',
              border: 'none',
              cursor: 'pointer',
              marginTop: '4px',
            }}>
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}

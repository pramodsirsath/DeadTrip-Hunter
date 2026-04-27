import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Truck } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useToast } from '../../components/Toast/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = { email, password };

      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
        credentials: "include",
      });
      const userdata = await res.json();
      if (res.ok) {
        toast('Login successful! Redirecting...', 'success');
        localStorage.setItem('token', userdata.token);
        localStorage.setItem('role', userdata.user.role);
        let role = userdata.user.role;
        setTimeout(() => {
          if (role === 'driver') {
            navigate('/driver/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
        }, 500);
      } else {
        toast(userdata.message || 'Login failed. Please try again.', 'error');
      }
    } catch (err) {
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div className="animate-scaleIn" style={{
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Truck size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              Welcome back
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              Sign in to your DeadTrip Hunter account
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{
            padding: '32px',
          }}>
            <form onSubmit={handleLogin} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  style={{ paddingLeft: '42px' }}
                />
              </div>

              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingLeft: '42px' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '8px',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.6s linear infinite',
                      display: 'inline-block',
                    }} />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{
              marginTop: '24px', textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                Create one
              </Link>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </PageTransition>
  );
}

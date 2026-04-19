// src/pages/Home.jsx
import React from 'react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { Zap, TrendingUp, Bell, ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Zap size={28} />,
    title: 'Smart Matching',
    desc: 'Automatically find return loads based on your forward trip routes and truck type.',
    color: '#3b82f6',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Profit Calculator',
    desc: 'Get estimates of fuel, tolls, and net profit for combined trips before accepting.',
    color: '#8b5cf6',
  },
  {
    icon: <Bell size={28} />,
    title: 'Real-Time Alerts',
    desc: 'Receive instant notifications when a return load is posted matching your criteria.',
    color: '#06b6d4',
  },
];

const stats = [
  { value: '10K+', label: 'Loads Matched', icon: <Truck size={20} /> },
  { value: '5K+', label: 'Active Drivers', icon: <Shield size={20} /> },
  { value: '99.9%', label: 'Uptime', icon: <Clock size={20} /> },
];

export default function Home() {
  return (
    <PageTransition>
      <div style={{ minHeight: '100vh' }}>

        {/* Hero Section */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 24px 100px',
        }}>
          {/* Animated gradient background blobs */}
          <div style={{
            position: 'absolute', top: '-120px', right: '-80px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} className="animate-float" />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-60px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} className="animate-float" />

          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', gap: '48px',
          }}>
            {/* Left — Text */}
            <div style={{ flex: '1 1 480px', position: 'relative', zIndex: 1 }}>
              <div className="animate-fadeInUp" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--info-soft)', border: '1px solid rgba(59,130,246,0.2)',
                padding: '6px 16px', borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-blue)',
                marginBottom: '24px',
              }}>
                <Zap size={14} /> Smart Load Matching Platform
              </div>

              <h1 className="animate-fadeInUp stagger-1" style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: '800',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '20px',
              }}>
                Eliminate Dead Trips.{' '}
                <span className="gradient-text">Maximize Profits.</span>
              </h1>

              <p className="animate-fadeInUp stagger-2" style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '32px',
                maxWidth: '520px',
              }}>
                Find return loads easily and grow your trucking business with our smart load matching system. No more empty return trips.
              </p>

              <div className="animate-fadeInUp stagger-3" style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap',
              }}>
                <Link to="/signup" className="btn btn-primary" style={{
                  padding: '14px 28px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-ghost" style={{
                  padding: '14px 28px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  Login
                </Link>
              </div>
            </div>

            {/* Right — Lottie Animation */}
            <div
              className="animate-fadeIn stagger-3"
              style={{ flex: '1 1 360px', display: 'flex', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{
                __html: `
                  <dotlottie-player
                    src="https://lottie.host/46216999-6c7a-4b44-8c73-562d0267cfca/HLeToeInhs.json"
                    background="transparent"
                    speed="1"
                    style="width: 100%; max-width: 480px; height: auto;"
                    loop
                    autoplay
                  ></dotlottie-player>
                `,
              }}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section style={{
          padding: '0 24px 80px',
          maxWidth: '1200px', margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card animate-fadeInUp" style={{
                padding: '24px',
                textAlign: 'center',
                animationDelay: `${0.1 + i * 0.1}s`,
              }}>
                <div style={{
                  color: 'var(--accent-blue)',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  {stat.icon}
                </div>
                <p style={{
                  fontSize: '2rem', fontWeight: '800',
                  marginBottom: '4px',
                }} className="gradient-text">
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '0.85rem', color: 'var(--text-tertiary)',
                  fontWeight: '500',
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '0 24px 100px',
          maxWidth: '1200px', margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="animate-fadeInUp" style={{
              fontSize: '2rem', fontWeight: '800',
              marginBottom: '12px',
            }}>
              Why Choose <span className="gradient-text">DeadTrip Hunter?</span>
            </h2>
            <p className="animate-fadeInUp stagger-1" style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              Built for modern trucking businesses to reduce waste and increase revenue.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card animate-fadeInUp"
                style={{
                  padding: '32px 28px',
                  animationDelay: `${0.2 + i * 0.15}s`,
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: `${feature.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: feature.color,
                  marginBottom: '20px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.15rem', fontWeight: '700',
                  marginBottom: '8px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '0.8rem',
        }}>
          © {new Date().getFullYear()} DeadTrip Hunter. All rights reserved.
        </footer>
      </div>
    </PageTransition>
  );
}

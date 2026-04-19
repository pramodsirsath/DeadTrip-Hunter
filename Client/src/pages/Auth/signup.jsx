import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Truck, CreditCard, FileText, ArrowRight, UserCheck } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useToast } from '../../components/Toast/Toast';
import { getCurrentLocation } from '../../utils/getCurrentLocation';

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    truckType: '',
    truckNumber: '',
    licenseNumber: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast('Passwords do not match!', 'error');
      return;
    }

    setLoading(true);

    try {
      const location = await getCurrentLocation();

      const dataToSend = {
        ...formData,
        role: role,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat]
        }
      };

      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        toast('Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast(data.message || 'Signup failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error("Error:", err);
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: 'name', type: 'text', placeholder: 'Full Name', icon: <User size={18} />, required: true },
    { name: 'email', type: 'email', placeholder: 'Email Address', icon: <Mail size={18} />, required: true },
    { name: 'phone', type: 'text', placeholder: 'Phone Number', icon: <Phone size={18} />, required: true },
    { name: 'password', type: 'password', placeholder: 'Password', icon: <Lock size={18} />, required: true },
    { name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password', icon: <Lock size={18} />, required: true },
  ];

  const driverFields = [
    { name: 'truckNumber', type: 'text', placeholder: 'Truck Number', icon: <CreditCard size={18} />, required: true },
    { name: 'licenseNumber', type: 'text', placeholder: 'Driving License Number', icon: <FileText size={18} />, required: true },
  ];

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
          position: 'absolute', top: '5%', right: '5%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '5%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div className="animate-scaleIn" style={{
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              Create your account
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              Join as a {role === 'driver' ? 'Driver' : 'Customer'} and start saving
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            {/* Role Selector */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '24px',
              border: '1px solid var(--border-subtle)',
            }}>
              {['customer', 'driver'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all var(--transition-base)',
                    background: role === r ? 'var(--accent-gradient)' : 'transparent',
                    color: role === r ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {r === 'customer' ? <User size={16} /> : <Truck size={16} />}
                  {r === 'customer' ? "I'm a Customer" : "I'm a Driver"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {inputFields.map((field) => (
                <div key={field.name} className="input-group">
                  <span className="input-icon">{field.icon}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="input"
                    required={field.required}
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              ))}

              {/* Driver-specific fields */}
              {role === 'driver' && (
                <div className="animate-fadeInUp" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}>
                  <div className="input-group">
                    <span className="input-icon"><Truck size={18} /></span>
                    <select
                      name="truckType"
                      value={formData.truckType}
                      onChange={handleChange}
                      className="input"
                      required
                      style={{ paddingLeft: '42px' }}
                    >
                      <option value="">Select Truck Type</option>
                      <option value="Container">Container</option>
                      <option value="Open">Open</option>
                      <option value="Trailer">Trailer</option>
                    </select>
                  </div>

                  {driverFields.map((field) => (
                    <div key={field.name} className="input-group">
                      <span className="input-icon">{field.icon}</span>
                      <input
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="input"
                        required={field.required}
                        style={{ paddingLeft: '42px' }}
                      />
                    </div>
                  ))}
                </div>
              )}

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
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{
              marginTop: '20px', textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                Sign in
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

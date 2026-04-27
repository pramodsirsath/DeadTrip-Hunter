import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Truck, CreditCard, FileText, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useToast } from '../../components/Toast/Toast';
import { getCurrentLocation } from '../../utils/getCurrentLocation';

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    truckType: '',
    truckNumber: '',
    licenseNumber: '',
    photo: null,
    rcBook: null,
    aadhar: null,
  });

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.files[0],
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast('Passwords do not match!', 'error');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await res.json();

        if (res.ok) {
          toast('OTP Sent to your email!', 'success');
          setStep(2);
        } else {
          toast(data.message || 'Failed to send OTP.', 'error');
        }
      } catch (err) {
        console.error("Error:", err);
        toast('Something went wrong. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 2) {
      if (!otp || otp.length < 6) {
        toast('Please enter a valid 6-digit OTP', 'error');
        return;
      }

      setLoading(true);
      try {
        const location = await getCurrentLocation();

        const formToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
             formToSend.append(key, formData[key]);
          }
        });
        formToSend.append('role', role);
        formToSend.append('otp', otp);
        formToSend.append('location', JSON.stringify({
          type: "Point",
          coordinates: [location.lng, location.lat]
        }));

        const res = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          body: formToSend,
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
            {step === 1 && (
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
            )}

            {/* Form */}
            {step === 1 ? (
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
                    
                    {/* Document Uploads */}
                    <div className="input-group">
                      <span className="input-icon" style={{ zIndex: 1 }}><FileText size={18} /></span>
                      <div style={{ paddingLeft: '42px', position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '10px' }}>Profile Photo</span>
                         <input type="file" name="photo" accept="image/*" onChange={handleFileChange} required className="input" style={{ paddingLeft: '10px', paddingTop: '10px' }} />
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <span className="input-icon" style={{ zIndex: 1 }}><FileText size={18} /></span>
                      <div style={{ paddingLeft: '42px', position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '10px' }}>RC Book</span>
                         <input type="file" name="rcBook" accept="image/*,application/pdf" onChange={handleFileChange} required className="input" style={{ paddingLeft: '10px', paddingTop: '10px' }} />
                      </div>
                    </div>

                    <div className="input-group">
                      <span className="input-icon" style={{ zIndex: 1 }}><FileText size={18} /></span>
                      <div style={{ paddingLeft: '42px', position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '10px' }}>Aadhar Card</span>
                         <input type="file" name="aadhar" accept="image/*,application/pdf" onChange={handleFileChange} required className="input" style={{ paddingLeft: '10px', paddingTop: '10px' }} />
                      </div>
                    </div>

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
                      Sending OTP...
                    </span>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="animate-fadeInUp" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <ShieldCheck size={48} style={{ color: 'var(--success)', margin: '0 auto', marginBottom: '16px' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Enter the 6-digit code sent to <strong style={{ color: 'white' }}>{formData.email}</strong>
                  </p>
                </div>
                
                <div className="input-group">
                   <input
                     type="text"
                     maxLength="6"
                     placeholder="0 0 0 0 0 0"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                     className="input"
                     required
                     style={{ 
                       textAlign: 'center', 
                       fontSize: '1.5rem', 
                       letterSpacing: '12px',
                       padding: '16px',
                       fontWeight: '700'
                     }}
                   />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '14px' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || otp.length < 6}
                    style={{ flex: 2, padding: '14px', opacity: (loading || otp.length < 6) ? 0.7 : 1 }}
                  >
                    {loading ? "Verifying..." : "Verify & Complete"}
                  </button>
                </div>
              </form>
            )}

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

import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Package, UserCog, FileText, CreditCard, MapPin, ArrowRight, Truck, Clock, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import PageTransition from '../../../components/PageTransition/PageTransition';
import GlassCard from '../../../components/GlassCard/GlassCard';
import StatCard from '../../../components/StatCard/StatCard';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import { useToast } from '../../../components/Toast/Toast';

export default function CustomerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("payment");

    if (status === "success") {
      setPaymentStatus("success");
      toast('Payment Successful! Your ride is confirmed.', 'success');
      setTimeout(() => {
        navigate("/customer/dashboard", { replace: true });
      }, 3000);
    }

    if (status === "failed") {
      setPaymentStatus("failed");
      toast('Payment Failed. Please try again.', 'error');
      setTimeout(() => {
        navigate("/customer/dashboard", { replace: true });
      }, 3000);
    }
  }, [location, navigate]);

  const [pendingPayments, setPendingPayments] = useState([]);
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.id;

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/reservation/customer-pending/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      setPendingPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
    const interval = setInterval(fetchPendingPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async (reservationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/payment/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId })
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast('Payment initiation failed.', 'error');
    }
  };

  const [rides, setRides] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [addresses, setAddresses] = React.useState({});

  const handleCancel = (rideId) => {
    fetch(`http://localhost:3000/rides/${rideId}/cancel`, {
      method: 'PATCH',
    })
      .then(res => {
        if (res.ok) {
          setRides(rides.filter(ride => ride._id !== rideId));
          toast("Ride cancelled successfully!", "success");
        } else {
          toast("Failed to cancel ride.", "error");
        }
      })
      .catch(err => {
        console.error("Error cancelling ride:", err);
        toast("An error occurred while cancelling the ride.", "error");
      });
  };

  const getAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `http://localhost:3000/rides/api/reverse-geocode?lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return (
        data.display_name ||
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Unknown"
      );
    } catch (err) {
      console.error("Error fetching address:", err);
      return "Error";
    }
  };

  React.useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await fetch(`http://localhost:3000/rides/user/${userId}`);
        const data = await res.json();
        setRides(data);

        const addressPromises = data.map(async (ride) => {
          const [srcLng, srcLat] = ride.source?.coordinates || [];
          const [destLng, destLat] = ride.destination?.coordinates || [];

          const pickup = srcLat && srcLng ? await getAddress(srcLat, srcLng) : "N/A";
          const drop = destLat && destLng ? await getAddress(destLat, destLng) : "N/A";

          return { rideId: ride._id, pickup, drop };
        });

        const resolvedAddresses = await Promise.all(addressPromises);
        const addrMap = {};
        resolvedAddresses.forEach(a => {
          addrMap[a.rideId] = { pickup: a.pickup, drop: a.drop };
        });
        setAddresses(addrMap);
      } catch (err) {
        console.error("Failed to load rides:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getStatusBadge = (status) => {
    const badgeClass = `badge badge-${status}`;
    const showDot = status === 'pending' || status === 'ongoing';
    return (
      <span className={badgeClass}>
        {showDot && <span className="dot"></span>}
        {status}
      </span>
    );
  };

  // Stats
  const totalRides = rides.length;
  const pendingRides = rides.filter(r => r.status === 'pending').length;
  const activeRides = rides.filter(r => r.status === 'accepted' || r.status === 'ongoing').length;
  const completedRides = rides.filter(r => r.status === 'completed').length;

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '24px 16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <div className="animate-fadeInUp" style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '1.8rem', fontWeight: '800',
            letterSpacing: '-0.02em', marginBottom: '4px',
          }}>
            Customer <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage your rides and payments
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <StatCard icon={<Package size={24} />} label="Total Rides" value={totalRides} color="var(--accent-blue)" delay={0.1} />
          <StatCard icon={<Clock size={24} />} label="Pending" value={pendingRides} color="var(--warning)" delay={0.2} />
          <StatCard icon={<Truck size={24} />} label="Active" value={activeRides} color="var(--success)" delay={0.3} />
          <StatCard icon={<CheckCircle size={24} />} label="Completed" value={completedRides} color="var(--accent-purple)" delay={0.4} />
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          <Link to="/post-ride" className="glass-card animate-fadeInUp" style={{
            padding: '20px 24px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animationDelay: '0.15s',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
            borderColor: 'rgba(59,130,246,0.25)',
          }}>
            <div style={{
              width: '44px', height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={22} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Post New Ride</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Create a load request</p>
            </div>
            <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
          </Link>

          <Link to="/customer/profile" className="glass-card animate-fadeInUp" style={{
            padding: '20px 24px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animationDelay: '0.25s',
          }}>
            <div style={{
              width: '44px', height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--success)', flexShrink: 0,
            }}>
              <UserCog size={22} />
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Manage Profile</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View account details</p>
            </div>
            <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
          </Link>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <GlassCard delay={0.2} style={{
            marginBottom: '24px',
            background: 'var(--warning-soft)',
            borderColor: 'rgba(245,158,11,0.25)',
          }}>
            <h2 className="section-title" style={{ marginBottom: '16px', color: 'var(--warning)' }}>
              <CreditCard size={20} />
              Payment Pending
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pickup</th>
                    <th>Drop</th>
                    <th>Fare</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((ride, idx) => (
                    <tr key={ride._id}>
                      <td>{idx + 1}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addresses[ride._id]?.pickup || "Loading..."}
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addresses[ride._id]?.drop || "Loading..."}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--warning)' }}>₹{ride.fare}</td>
                      <td>
                        <button
                          onClick={() => handlePayment(ride.reservationId)}
                          className="btn btn-success"
                          style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                        >
                          <CreditCard size={14} />
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Posted Rides */}
        <GlassCard delay={0.3}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>
            <Truck size={20} />
            My Posted Rides
          </h2>

          {loading ? (
            <SkeletonLoader rows={4} />
          ) : rides.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-secondary)',
            }}>
              <Package size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>No rides posted yet</p>
              <p style={{ fontSize: '0.85rem' }}>Create your first ride to get started</p>
              <Link to="/post-ride" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Post a Ride
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pickup</th>
                    <th>Drop</th>
                    <th>Status</th>
                    <th>Fare</th>
                    <th>Action</th>
                    <th>Track</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, idx) => (
                    <tr key={ride._id}>
                      <td>{idx + 1}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addresses[ride._id]?.pickup || "Loading..."}
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {addresses[ride._id]?.drop || "Loading..."}
                      </td>
                      <td>{getStatusBadge(ride.status)}</td>
                      <td style={{ fontWeight: '600' }}>₹{ride.fare}</td>
                      <td>
                        {ride.status === "pending" && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancel(ride._id)}
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        )}
                      </td>
                      <td>
                        {ride.status === "accepted" || ride.status === "ongoing" ? (
                          <Link
                            to={`/track/${ride._id}`}
                            className="btn btn-outline"
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} />
                            Track
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import ReturnModeToggle from "../DashBoard/ReturnModeToggle";
import AvailableLoads from "../DashBoard/AvailableLoads";
import ReturnLoads from "../DashBoard/ReturnLoads";
import AcceptedLoads from "../DashBoard/AcceptedLoads";
import { getReadableAddress } from "../../../utils/getReadableAddress";
import { getCurrentLocation } from "../../../utils/getCurrentLocation";
import { generateFCMToken } from "../../../firebase/getFCMToken";
import DriverReservationBanner from "./DriverReservationBanner";
import { Truck, UserCog, ArrowRight, History, X, Info, Wallet, CheckCircle } from 'lucide-react';
import PageTransition from '../../../components/PageTransition/PageTransition';
import { useToast } from '../../../components/Toast/Toast';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [isReturnMode, setIsReturnMode] = useState(false);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [returnLoads, setReturnLoads] = useState([]);
  const [acceptedLoads, setAcceptedLoads] = useState([]);
  const [historicalRides, setHistoricalRides] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [user, setUser] = useState(null);
  
  const [upiId, setUpiId] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    generateFCMToken();
  }, []);

  const enrichRidesWithAddress = async (rides) => {
    return Promise.all(
      rides.map(async (ride) => {
        if (!ride.source?.coordinates || !ride.destination?.coordinates) {
          return ride;
        }

        const [srcLng, srcLat] = ride.source.coordinates;
        const [destLng, destLat] = ride.destination.coordinates;

        const sourceAddress = await getReadableAddress(srcLat, srcLng);
        const destinationAddress = await getReadableAddress(destLat, destLng);

        return {
          ...ride,
          sourceAddress,
          destinationAddress
        };
      })
    );
  };

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error);
  }, []);

  const fetchPending = async () => {
    const position = await getCurrentLocation();

    const res = await fetch("http://localhost:3000/rides/filter-pending", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lat: position.lat,
        lng: position.lng
      })
    });

    const data = await res.json();
    const enriched = await enrichRidesWithAddress(data);
    setAvailableLoads(enriched);
  };

  const fetchReturnRides = async () => {
    const allRidesRes = await fetch(
      "http://localhost:3000/rides/pending",
      { credentials: "include" }
    );

    const allRides = await allRidesRes.json();

    const filterRes = await fetch(
      "http://localhost:3000/return/rides/return-rides",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rides: allRides })
      }
    );

    const { validRides } = await filterRes.json();
    const enriched = await enrichRidesWithAddress(validRides);
    setReturnLoads(enriched);
  };

  const fetchAccepted = async (driverId) => {
    const res = await fetch(
      `http://localhost:3000/rides/accepted/${driverId}`,
      { credentials: "include" }
    );
    const data = await res.json();
    const enriched = await enrichRidesWithAddress(data);
    setAcceptedLoads(enriched);
  };

  const fetchHistoricalRides = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:3000/rides/user/${driverId}`);
      const data = await res.json();
      const cancelledOnly = data.filter(r => r.status === 'cancelled');
      const enriched = await enrichRidesWithAddress(cancelledOnly);
      setHistoricalRides(enriched);
    } catch (err) {
      console.error("Failed to fetch historical rides:", err);
    }
  };

  const fetchWithdrawals = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/payment/withdrawals/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawals:", err);
    }
  };

  useEffect(() => {
    if (isReturnMode) {
      fetchReturnRides();
    } else {
      fetchPending();
    }
  }, [isReturnMode]);

  useEffect(() => {
    if (user?._id) {
      fetchAccepted(user._id);
      fetchHistoricalRides(user._id);
      fetchWithdrawals(user._id);
    }
  }, [user?._id]);

  const handleAccept = async (rideId) => {
    try {
      if (!user?._id) {
        toast("User not found", "error");
        return;
      }

      const res = await fetch(
        `http://localhost:3000/rides/${rideId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverId: user._id }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast(err.message || "Failed to accept ride", "error");
        return;
      }

      toast("Ride accepted successfully!", "success");
      fetchPending();
      if (isReturnMode) fetchReturnRides();
      if (user?._id) fetchAccepted(user._id);

    } catch (err) {
      console.error(err);
      toast("An error occurred", "error");
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:3000/rides/${rideId}/start`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: user._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start ride");
      
      toast("Ride started successfully!", "success");
      
      if (data.otp) {
        alert(`TESTING ONLY: The completion OTP is ${data.otp}. Usually, this is sent to the customer.`);
      }
      
      fetchAccepted(user._id);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleEndRide = async (rideId, otp, location) => {
    try {
      const res = await fetch(`http://localhost:3000/rides/${rideId}/complete`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: user._id, otp, location })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end ride");
      toast("Ride completed successfully!", "success");
      fetchAccepted(user._id);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleDriverCancel = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:3000/rides/${rideId}/driver-cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: user._id, reason: "Cancelled by driver via dashboard" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel ride");
      
      if (data.refundAmount !== undefined) {
        toast(`Ride cancelled. Customer fully refunded: ₹${data.refundAmount}`, "info");
      } else {
        toast("Ride cancelled.", "success");
      }
      
      fetchAccepted(user._id);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleClaim = async () => {
    if (!upiId) return toast("Please enter your UPI ID", "error");
    if (!claimAmount || isNaN(claimAmount) || Number(claimAmount) <= 0) {
      return toast("Please enter a valid amount", "error");
    }
    if (Number(claimAmount) > (user?.walletBalance || 0)) {
      return toast("Insufficient wallet balance", "error");
    }

    setClaiming(true);
    try {
      const res = await fetch("http://localhost:3000/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: user._id,
          amount: Number(claimAmount),
          upiId
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to process withdrawal");
      
      toast("Withdrawal initiated successfully!", "success");
      
      setUser(prev => ({ ...prev, walletBalance: data.newBalance }));
      setClaimAmount("");
      setUpiId("");
      fetchWithdrawals(user._id);
      
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '24px 16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <div className="animate-fadeInUp" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.8rem', fontWeight: '800',
              letterSpacing: '-0.02em', marginBottom: '4px',
            }}>
              Driver <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Find and accept loads
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowRefundModal(true)} className="btn btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
              <Wallet size={16} />
              Wallet & History
            </button>
            <Link to="/driver/profile" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
              <UserCog size={16} />
              Profile
            </Link>
          </div>
        </div>

        {/* Reservation Banner */}
        <DriverReservationBanner onRefresh={() => {
          window.location.reload();
        }} />

        {/* Return Mode Toggle */}
        <div className="animate-fadeInUp" style={{ marginBottom: '20px', animationDelay: '0.1s' }}>
          <ReturnModeToggle
            isReturnMode={isReturnMode}
            setIsReturnMode={setIsReturnMode}
          />
        </div>

        {/* Available / Return Loads */}
        <div className="animate-fadeInUp" style={{ marginBottom: '20px', animationDelay: '0.2s' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            {isReturnMode ? (
              <ReturnLoads
                loads={returnLoads}
                onAccept={handleAccept}
              />
            ) : (
              <AvailableLoads
                loads={availableLoads}
                onAccept={handleAccept}
              />
            )}
          </div>
        </div>

        {/* Accepted Loads */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <AcceptedLoads
            loads={acceptedLoads}
            onViewMap={(id) => navigate(`/track/${id}`)}
            onStartRide={handleStartRide}
            onEndRide={handleEndRide}
            onCancelRide={handleDriverCancel}
          />
        </div>

        {/* Refund History Modal */}
        {showRefundModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
          }}>
            <div className="glass-card animate-fadeInUp" style={{
              width: '100%', maxWidth: '600px', maxHeight: '80vh',
              background: 'var(--bg-primary)', overflowY: 'auto',
              padding: '0', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ 
                padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10
              }}>
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Wallet size={20} color="var(--success)" />
                  Wallet & History
                </h2>
                <button onClick={() => setShowRefundModal(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* WALLET BALANCE & CLAIM SECTION */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginBottom: '24px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current Balance</p>
                    <h3 style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: '700', margin: '4px 0 0 0' }}>
                      ₹{user?.walletBalance || 0}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <input 
                        type="number" 
                        placeholder="Amount" 
                        className="input" 
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 2, minWidth: '200px' }}>
                      <input 
                        type="text" 
                        placeholder="UPI VPA ID (e.g., driver@upi)" 
                        className="input" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <button 
                      className="btn btn-success" 
                      onClick={handleClaim}
                      disabled={claiming || !user?.walletBalance}
                      style={{
                        opacity: claiming || !user?.walletBalance ? 0.6 : 1,
                        cursor: claiming || !user?.walletBalance ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {claiming ? "Processing..." : "Claim Funds"}
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={18} />
                  Transactions & Penalties
                </h3>

                {(historicalRides.length === 0 && withdrawals.length === 0) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                    <Info size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>No cancelled rides found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {historicalRides.map(ride => (
                      <div key={ride._id} style={{
                        padding: '16px', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            {new Date(ride.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`badge ${ride.cancelledBy === 'driver' ? 'badge-danger' : 'badge-warning'}`}>
                            Cancelled by {ride.cancelledBy || 'System'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                          <span style={{ maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ride.sourceAddress || "Unknown"}
                          </span>
                          <ArrowRight size={14} color="var(--text-tertiary)" />
                          <span style={{ maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ride.destinationAddress || "Unknown"}
                          </span>
                        </div>

                        <div style={{ 
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                          background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)'
                        }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Your Compensation</p>
                            <p style={{ fontWeight: '700', color: ride.cancelledBy === 'customer' ? 'var(--success)' : 'var(--text-secondary)', fontSize: '1.1rem' }}>
                              ₹{ride.driverCompensation || 0}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Customer Refund (Penalty)</p>
                            <p style={{ fontWeight: '700', color: ride.cancelledBy === 'driver' ? 'var(--danger)' : 'var(--warning)', fontSize: '1.1rem' }}>
                              ₹{ride.refundAmount || 0}
                            </p>
                          </div>
                        </div>
                        {ride.cancellationReason && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px', fontStyle: 'italic' }}>
                            Reason: {ride.cancellationReason}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Show Withdrawals */}
                    {withdrawals.map(wd => (
                      <div key={wd._id} style={{
                        padding: '16px', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            {new Date(wd.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`badge badge-${wd.status === 'completed' ? 'success' : 'pending'}`}>
                            {wd.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <CheckCircle size={16} color="var(--success)" />
                          <span style={{ fontWeight: '600' }}>Fund Withdrawal</span>
                        </div>

                        <div style={{ 
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                          background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)'
                        }}>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Amount Sent</p>
                            <p style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem' }}>
                              ₹{wd.amount}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>UPI ID</p>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {wd.upiId}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import socket from "../../../socket";
import { Map, MapPin, ArrowRight, Eye, Play, CheckCircle, XCircle, ClipboardCheck, Truck, Fuel, IndianRupee, Send } from 'lucide-react';
import { getCurrentLocation } from "../../../utils/getCurrentLocation";
import "./AcceptedLoads.css";
const driverLocationMap = {};

export default function AcceptedLoads({ loads, onViewMap, onStartRide, onEndRide, onCancelRide }) {
  const [activeOtpRide, setActiveOtpRide] = useState(null);
  const [otp, setOtp] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    // ── Auto-filled from ride data (read-only) ──
    pickup_location: "",
    drop_location: "",
    truck_type: "",
    weight: "",
    ride_distance: "",
    fare: "",
    // ── Driver fills these after completing the ride ──
    fuel_consumed: "",
    fuel_price: "",
    vehicle_mileage: "",
    toll_charges: "",
    other_expenses: "",
  });

  // ── Real-time profit calculation ──
  const calculatedTotalExpense = useMemo(() => {
    const fuelCost = (parseFloat(feedbackData.fuel_consumed) || 0) * (parseFloat(feedbackData.fuel_price) || 0);
    const tolls = parseFloat(feedbackData.toll_charges) || 0;
    const other = parseFloat(feedbackData.other_expenses) || 0;
    return fuelCost + tolls + other;
  }, [feedbackData.fuel_consumed, feedbackData.fuel_price, feedbackData.toll_charges, feedbackData.other_expenses]);

  const calculatedProfit = useMemo(() => {
    const fare = parseFloat(feedbackData.fare) || 0;
    return fare - calculatedTotalExpense;
  }, [feedbackData.fare, calculatedTotalExpense]);

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const startDriverLocation = (rideId) => {
    if (!rideId || driverLocationMap[rideId]) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        socket.emit("driverLocation", {
          rideId,
          coordinates: [coords.longitude, coords.latitude]
        });
      },
      console.error,
      { enableHighAccuracy: true }
    );

    driverLocationMap[rideId] = watchId;
  };

  useEffect(() => {
    loads.forEach(ride => startDriverLocation(ride._id));
  }, [loads]);

  const handleEndClick = async (ride) => {
    if (!otp || otp.length !== 4) {
      alert("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      const position = await getCurrentLocation();

      const success = await onEndRide(
        ride._id,
        otp,
        { lat: position.lat, lng: position.lng }
      );

      if (success) {
        const distance = getDistance(
          ride.source.coordinates[1],
          ride.source.coordinates[0],
          ride.destination.coordinates[1],
          ride.destination.coordinates[0]
        );

        setSelectedRide(ride);

        setFeedbackData({
          pickup_location: ride.sourceAddress || `${ride.source.coordinates[1].toFixed(4)}, ${ride.source.coordinates[0].toFixed(4)}`,
          drop_location: ride.destinationAddress || `${ride.destination.coordinates[1].toFixed(4)}, ${ride.destination.coordinates[0].toFixed(4)}`,
          truck_type: ride.truckType,
          weight: ride.weight,
          ride_distance: distance.toFixed(2),
          fare: ride.fare,
          fuel_consumed: "",
          fuel_price: "",
          vehicle_mileage: "",
          toll_charges: "",
          other_expenses: "",
        });

        setShowFeedbackForm(true);
      }

      setActiveOtpRide(null);
      setOtp("");

    } catch (err) {
      alert("Location is required to end the ride.");
    }
  };

  const handleFeedbackChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...feedbackData,
      total_expense: calculatedTotalExpense,
      net_profit: calculatedProfit,
      rideId: selectedRide?._id,
      driverId: selectedRide?.driverId || selectedRide?.driverId?._id // Fallbacks for ID
    };
    console.log("Feedback submitted:", submissionData);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (!res.ok) {
        console.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }

    setShowFeedbackForm(false);
    setSelectedRide(null);
  };

  useEffect(() => {
    if (showFeedbackForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showFeedbackForm]);

  return (
    <>
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 className="section-title" style={{ marginBottom: '16px' }}>
          <Map size={20} />
          My Accepted Rides
        </h2>

        {loads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 24px',
            color: 'var(--text-secondary)',
          }}>
            <Map size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>No accepted rides yet</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Accept a ride to get started</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}>
            {loads.map(ride => (
              <div key={ride._id} style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all var(--transition-base)',
              }}>
                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.85rem', color: 'var(--text-primary)',
                    maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    <MapPin size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    {ride.sourceAddress}
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.85rem', color: 'var(--text-primary)',
                    maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    <MapPin size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    {ride.destinationAddress}
                  </span>
                </div>

                {/* Bottom row actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <span className={`badge ${ride.status === 'in_progress' ? 'badge-warning' : 'badge-active'}`}>
                    {ride.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                  </span>
                  
                  <div className="flex-wrap" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onViewMap(ride._id)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      title="View Map"
                    >
                      <Eye size={14} />
                    </button>

                    {ride.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => onStartRide(ride._id)}
                          className="btn btn-success"
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          <Play size={14} />
                          Start
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm('Are you sure? This will refund the customer and penalize your account.')) {
                              onCancelRide(ride._id);
                            }
                          }}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="Cancel Ride"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}

                    {ride.status === 'in_progress' && (
                      <button
                        onClick={() => setActiveOtpRide(activeOtpRide === ride._id ? null : ride._id)}
                        className="btn btn-success"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <CheckCircle size={14} />
                        End Ride
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP Input Section for Ending Ride */}
                {activeOtpRide === ride._id && (
                  <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <input 
                      type="text" 
                      placeholder="Enter 4-digit OTP" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={4}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                    <button 
                      onClick={() => handleEndClick(ride)}
                      className="btn btn-success"
                      style={{ padding: '8px 16px' }}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          POST-RIDE FEEDBACK FORM — Collects ML training data
          ═══════════════════════════════════════════════════════ */}
      {showFeedbackForm && createPortal(
        <div className="feedback-overlay" onClick={() => setShowFeedbackForm(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="feedback-header">
              <div className="feedback-header-icon">
                <ClipboardCheck size={26} />
              </div>
              <h2>Post-Ride Feedback</h2>
              <p>Help us improve profit predictions for future rides</p>
            </div>

            <form onSubmit={handleFeedbackSubmit}>

              {/* ── SECTION 1: Auto-Filled Ride Details ── */}
              <div className="feedback-section">
                <div className="feedback-section-label">
                  <span className="section-icon auto">
                    <Truck size={11} />
                  </span>
                  Ride Details — Auto Filled
                </div>

                <div className="feedback-grid">
                  <div className="feedback-field full-width">
                    <label className="feedback-label">
                      Pickup Location <span className="auto-badge">Auto</span>
                    </label>
                    <input
                      className="feedback-input"
                      type="text"
                      value={feedbackData.pickup_location}
                      readOnly
                    />
                  </div>

                  <div className="feedback-field full-width">
                    <label className="feedback-label">
                      Drop Location <span className="auto-badge">Auto</span>
                    </label>
                    <input
                      className="feedback-input"
                      type="text"
                      value={feedbackData.drop_location}
                      readOnly
                    />
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">
                      Truck Type <span className="auto-badge">Auto</span>
                    </label>
                    <input
                      className="feedback-input"
                      type="text"
                      value={feedbackData.truck_type}
                      readOnly
                    />
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">
                      Load Weight <span className="auto-badge">Auto</span>
                    </label>
                    <input
                      className="feedback-input"
                      type="text"
                      value={feedbackData.weight}
                      readOnly
                    />
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">
                      Trip Distance <span className="auto-badge">Auto</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="text"
                        value={feedbackData.ride_distance}
                        readOnly
                      />
                      <span className="field-unit">KM</span>
                    </div>
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">
                      Fare Received <span className="auto-badge">Auto</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="text"
                        value={feedbackData.fare}
                        readOnly
                      />
                      <span className="field-unit">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feedback-divider" />

              {/* ── SECTION 2: Driver Input — Expense Details ── */}
              <div className="feedback-section">
                <div className="feedback-section-label">
                  <span className="section-icon manual">
                    <Fuel size={11} />
                  </span>
                  Expense Details — Fill Below
                </div>

                <div className="feedback-grid">
                  <div className="feedback-field">
                    <label className="feedback-label">Fuel Consumed</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 25"
                        value={feedbackData.fuel_consumed}
                        onChange={(e) => handleFeedbackChange('fuel_consumed', e.target.value)}
                      />
                      <span className="field-unit">Litres</span>
                    </div>
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">Fuel Price (per litre)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 105"
                        value={feedbackData.fuel_price}
                        onChange={(e) => handleFeedbackChange('fuel_price', e.target.value)}
                      />
                      <span className="field-unit">₹/L</span>
                    </div>
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">Vehicle Mileage</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 8"
                        value={feedbackData.vehicle_mileage}
                        onChange={(e) => handleFeedbackChange('vehicle_mileage', e.target.value)}
                      />
                      <span className="field-unit">KM/L</span>
                    </div>
                  </div>

                  <div className="feedback-field">
                    <label className="feedback-label">Toll Charges</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 500"
                        value={feedbackData.toll_charges}
                        onChange={(e) => handleFeedbackChange('toll_charges', e.target.value)}
                      />
                      <span className="field-unit">₹</span>
                    </div>
                  </div>

                  <div className="feedback-field full-width">
                    <label className="feedback-label">Other Expenses (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="feedback-input input-with-unit"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Food + Maintenance etc."
                        value={feedbackData.other_expenses}
                        onChange={(e) => handleFeedbackChange('other_expenses', e.target.value)}
                      />
                      <span className="field-unit">₹</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feedback-divider" />

              {/* ── SECTION 3: Live Profit Calculation ── */}
              <div className="feedback-section">
                <div className="feedback-section-label">
                  <span className="section-icon result">
                    <IndianRupee size={11} />
                  </span>
                  Profit Calculation
                </div>

                <div className="profit-display">
                  <div className="profit-label-group">
                    <span className="profit-label">Net Profit</span>
                    <span className="profit-sublabel">Fare − Calculated Expenses</span>
                  </div>
                  <span className={`profit-value ${calculatedProfit < 0 ? 'negative' : calculatedProfit === 0 ? 'zero' : ''}`}>
                    {calculatedProfit >= 0 ? '+' : ''}₹{calculatedProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* ── Submit ── */}
              <button className="feedback-submit-btn" type="submit">
                <Send size={16} />
                Submit Feedback
              </button>

              <button
                className="feedback-skip-btn"
                type="button"
                onClick={() => setShowFeedbackForm(false)}
              >
                Skip for now
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

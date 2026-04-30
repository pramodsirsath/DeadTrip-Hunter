import { useEffect, useState } from "react";
import socket from "../../../socket";
import { Map, MapPin, ArrowRight, Eye, Play, CheckCircle, XCircle } from 'lucide-react';
import { getCurrentLocation } from "../../../utils/getCurrentLocation";

const driverLocationMap = {};

export default function AcceptedLoads({ loads, onViewMap, onStartRide, onEndRide, onCancelRide }) {
  const [activeOtpRide, setActiveOtpRide] = useState(null);
  const [otp, setOtp] = useState("");

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

  const handleEndClick = async (rideId) => {
    if (!otp || otp.length !== 4) {
      alert("Please enter a valid 4-digit OTP.");
      return;
    }
    try {
      const position = await getCurrentLocation();
      onEndRide(rideId, otp, { lat: position.lat, lng: position.lng });
      setActiveOtpRide(null);
      setOtp("");
    } catch (err) {
      alert("Location is required to end the ride.");
    }
  };

  return (
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
                    onClick={() => handleEndClick(ride._id)}
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
  );
}

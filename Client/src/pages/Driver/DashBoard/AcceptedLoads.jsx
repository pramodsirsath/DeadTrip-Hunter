import { useEffect } from "react";
import socket from "../../../socket";
import { Map, MapPin, ArrowRight, Eye } from 'lucide-react';

const driverLocationMap = {};

export default function AcceptedLoads({ loads, onViewMap }) {

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

              {/* Bottom row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span className="badge badge-active">{ride.truckType}</span>
                <button
                  onClick={() => onViewMap(ride._id)}
                  className="btn btn-success"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Eye size={14} />
                  View Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

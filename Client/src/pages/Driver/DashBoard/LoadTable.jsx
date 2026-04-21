import { CheckCircle, MapPin, ArrowRight, Truck } from 'lucide-react';

export default function LoadTable({ loads, onAccept }) {
  if (loads.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 24px',
        color: 'var(--text-secondary)',
      }}>
        <Truck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>No loads available right now</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Check back later for new loads</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Destination</th>
            <th>Truck</th>
            <th>Date</th>
            <th>Weight</th>
            <th>Fare</th>
            <th className="hide-mobile">Details</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loads.map(ride => (
            <tr key={ride._id}>
              <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  {ride.sourceAddress}
                </span>
              </td>
              <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  {ride.destinationAddress}
                </span>
              </td>
              <td>
                <span className="badge badge-active">{ride.truckType}</span>
              </td>
              <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                {new Date(ride.date).toLocaleDateString()}
              </td>
              <td>{ride.weight}</td>
              <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                {ride.fare ? `₹${ride.fare}` : '-'}
              </td>
              <td className="hide-mobile" style={{
                maxWidth: '140px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'var(--text-secondary)', fontSize: '0.8rem',
              }}>
                {ride.loadDetails}
              </td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => onAccept(ride._id)}
                  style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                >
                  <CheckCircle size={14} />
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

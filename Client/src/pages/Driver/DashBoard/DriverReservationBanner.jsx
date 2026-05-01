import React, { useEffect, useState, useRef } from "react";
import { getReadableAddress } from "../../../utils/getReadableAddress";
import { Clock, MapPin, ArrowRight } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL;

export default function DriverReservationBanner({ onRefresh }) {

  const [reservation, setReservation] = useState(null);
  const reservationRef = useRef(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");

  const token = localStorage.getItem("token");

  const fetchReservation = async () => {
    try {
      const res = await fetch(`${API}/api/reservation/driver-active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      // If reservation just cleared (payment completed or timeout)
      if (reservationRef.current && !data) {
        if (onRefresh) onRefresh();
      }
      reservationRef.current = data;

      setReservation(data);

      if (data?.ride) {
        const [srcLng, srcLat] = data.ride.source.coordinates;
        const [destLng, destLat] = data.ride.destination.coordinates;

        const sourceAddress = await getReadableAddress(srcLat, srcLng);
        const destinationAddress = await getReadableAddress(destLat, destLng);

        setPickupAddress(sourceAddress);
        setDropAddress(destinationAddress);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservation();
    const interval = setInterval(fetchReservation, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!reservation) return null;

  return (
    <div className="animate-fadeInDown" style={{
      background: 'var(--warning-soft)',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: '40px', height: '40px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(245,158,11,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--warning)',
        flexShrink: 0,
        animation: 'pulseDot 2s ease-in-out infinite',
      }}>
        <Clock size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight: '700',
          fontSize: '0.9rem',
          color: 'var(--warning)',
          marginBottom: '4px',
        }}>
          Waiting for customer payment...
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}>
          <MapPin size={12} style={{ color: 'var(--success)' }} />
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pickupAddress}
          </span>
          <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
          <MapPin size={12} style={{ color: 'var(--danger)' }} />
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dropAddress}
          </span>
        </div>
      </div>
    </div>
  );
}
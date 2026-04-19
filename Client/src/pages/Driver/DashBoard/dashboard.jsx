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
import { Truck, UserCog, ArrowRight } from 'lucide-react';
import PageTransition from '../../../components/PageTransition/PageTransition';
import { useToast } from '../../../components/Toast/Toast';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [isReturnMode, setIsReturnMode] = useState(false);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [returnLoads, setReturnLoads] = useState([]);
  const [acceptedLoads, setAcceptedLoads] = useState([]);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    if (isReturnMode) {
      fetchReturnRides();
    } else {
      fetchPending();
    }
  }, [isReturnMode]);

  useEffect(() => {
    if (user?._id) fetchAccepted(user._id);
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
            <Link to="/driver/profile" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
              <UserCog size={16} />
              Profile
            </Link>
          </div>
        </div>

        {/* Reservation Banner */}
        <DriverReservationBanner />

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
          />
        </div>
      </div>
    </PageTransition>
  );
}

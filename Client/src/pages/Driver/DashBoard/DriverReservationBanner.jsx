import React, { useEffect, useState } from "react";
import { getReadableAddress } from "../../../utils/getReadableAddress";

const API = "http://localhost:3000";

export default function DriverReservationBanner() {

  const [reservation, setReservation] = useState(null);
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
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 mb-4 rounded">
      <strong>Waiting for customer payment...</strong>
      <div>
        From: {pickupAddress} → To: {dropAddress}
      </div>
    </div>
  );
}
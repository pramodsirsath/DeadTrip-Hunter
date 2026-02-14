import { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";

import ReturnModeToggle from "../DashBoard/ReturnModeToggle";
import AvailableLoads from "../DashBoard/AvailableLoads";
import ReturnLoads from "../DashBoard/ReturnLoads";
import AcceptedLoads from "../DashBoard/AcceptedLoads";
import { getReadableAddress } from "../../../utils/getReadableAddress";


export default function DriverDashboard() {
  const navigate = useNavigate();

  const [isReturnMode, setIsReturnMode] = useState(false);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [returnLoads, setReturnLoads] = useState([]);
  const [acceptedLoads, setAcceptedLoads] = useState([]);
  const [user, setUser] = useState(null);



  //human readable addresses from lat lang for available loads
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




  // 🔹 Get logged-in user
  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(console.error);
  }, []);

  // 🔹 Pending rides (normal mode)
  const fetchPending = async () => {
    const res = await fetch("http://localhost:3000/rides/pending", {
      credentials: "include"
    });
    const data = await res.json();


    const enriched = await enrichRidesWithAddress(data);

    setAvailableLoads(enriched);
  };



  // 🔹 Return rides (return mode)
const fetchReturnRides = async () => {
  // 1️⃣ First get ALL potential return rides from your main rides API
  const allRidesRes = await fetch(
    "http://localhost:3000/rides/pending",
    { credentials: "include" }
  );

  const allRides = await allRidesRes.json();

  // 2️⃣ Now send them to backend to filter inside corridor
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

  // 3️⃣ Enrich and set state
  const enriched = await enrichRidesWithAddress(validRides);
  setReturnLoads(enriched);
};




  // 🔹 Accepted rides (always)
  const fetchAccepted = async (driverId) => {
    const res = await fetch(
      `http://localhost:3000/rides/accepted/${driverId}`,
      { credentials: "include" }
    );
    const data = await res.json();
    const enriched = await enrichRidesWithAddress(data);
    setAcceptedLoads(enriched);
  };


  // useEffect(() => {
  //   fetchPending();
  // }, []);

useEffect(() => {

  if (isReturnMode) {
    fetchReturnRides();
  } else {
    fetchPending();   // 🔥 reload normal rides when exit
  }

}, [isReturnMode]);


  useEffect(() => {
    if (user?._id) fetchAccepted(user._id);
  }, [user?._id]);

  // 🔹 ACCEPT RIDE
  const handleAccept = async (rideId) => {
    try {
      if (!user?._id) return alert("User not found");

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
        alert(err.message || "Failed to accept ride");
        return;
      }

      // refresh lists
      fetchPending();
      if (isReturnMode) fetchReturnRides();
      if (user?._id) fetchAccepted(user._id);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Driver Dashboard
      </h1>

      <ReturnModeToggle
        isReturnMode={isReturnMode}
        setIsReturnMode={setIsReturnMode}
      />

      {/* 🔹 Pending rides (normal or return) */}
      <div className="bg-white p-6 rounded-2xl shadow mt-6">
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

      {/* 🔹 Accepted rides (always visible) */}
      <AcceptedLoads
        loads={acceptedLoads}
        onViewMap={(id) => navigate(`/track/${id}`)}
      />
    </div>
  );
}

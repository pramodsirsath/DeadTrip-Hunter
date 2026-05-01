import LoadTable from "./LoadTable";
import CheckMap from "./CheckMap";
import { useEffect, useState } from "react";
import { Home } from 'lucide-react';

export default function ReturnLoads({ loads, onAccept }) {
    const [data, setData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try{
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/return/rides/status`, {
            method: "GET",
            credentials: "include"

          });
          const result = await res.json();
          setData(result);
        }catch(err){
          console.error("Error fetching return mode status:", err);
        }
      }
      fetchData();
    },[]);

  return (
    <>
      <h2 className="section-title" style={{ marginBottom: '16px' }}>
        <Home size={20} />
        Rides On Your Way Home
      </h2>
      <LoadTable loads={loads} onAccept={onAccept} />
      {/* <CheckMap data={data}/> */}
    </>
  );
}

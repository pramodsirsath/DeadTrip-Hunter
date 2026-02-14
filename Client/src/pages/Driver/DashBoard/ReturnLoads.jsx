import LoadTable from "./LoadTable";
import CheckMap from "./checkMap";
import { useEffect, useState } from "react";

export default function ReturnLoads({ loads, onAccept }) {
    const [data, setData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try{
          const res = await fetch("http://localhost:3000/return/rides/status", {
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
      <h2 className="text-xl font-bold mb-4">
        Rides On Your Way Home
      </h2>
      <LoadTable loads={loads} onAccept={onAccept} />
      <CheckMap data={data}/>
    </>
  );
}

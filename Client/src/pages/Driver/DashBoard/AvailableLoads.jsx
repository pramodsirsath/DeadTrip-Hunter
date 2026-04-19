import LoadTable from "./LoadTable";
import { Truck } from 'lucide-react';

export default function AvailableLoads({ loads, onAccept }) {
  return (
    <>
      <h2 className="section-title" style={{ marginBottom: '16px' }}>
        <Truck size={20} />
        Available Rides
      </h2>
      <LoadTable loads={loads} onAccept={onAccept} />
    </>
  );
}

import LoadTable from "./LoadTable";

export default function AvailableLoads({ loads, onAccept }) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Available Rides</h2>
      <LoadTable loads={loads} onAccept={onAccept} />
    </>
  );
}

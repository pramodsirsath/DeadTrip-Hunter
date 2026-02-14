export default function LoadTable({ loads, onAccept }) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th>Source</th>
          <th>Destination</th>
          <th>Truck</th>
          <th>Date</th>
          <th>Weight</th>
          <th>Details</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {loads.map(ride => (
          <tr key={ride._id}>
            <td>{ride.sourceAddress}</td>
            <td>{ride.destinationAddress}</td>
            <td>{ride.truckType}</td>
            <td>{new Date(ride.date).toLocaleDateString()}</td>
            <td>{ride.weight}</td>
            <td>{ride.loadDetails}</td>
            <td>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => onAccept(ride._id)}
              >
                Accept
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

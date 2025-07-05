import { getServiceEvents } from "@/hooks/useService";
import { useState } from "react";

const HistoryEventsList = ({ serviceId }: { serviceId: string }) => {
    const [page, setPage] = useState(1);
    const limit = 20;
  
    const { data, isLoading, isError } = getServiceEvents(serviceId, page, limit);
  
    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading events.</p>;
  
    return (
      <div>
        <ul>
          {data?.data.map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
  
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Previous</button>
          <span>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>Next</button>
        </div>
      </div>
    );
  };


export default HistoryEventsList;
  
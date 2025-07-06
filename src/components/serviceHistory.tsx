import { getServiceEvents } from "@/hooks/useService";
import { useEffect, useRef } from "react";

const HistoryEventsList = ({ serviceId }: { serviceId: string }) => {
    const limit = 20;
  
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        error,
      } = getServiceEvents(serviceId, limit);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasNextPage) return;
    
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              fetchNextPage();
            }
          },
          { threshold: 1 }
        );
    
        const current = loadMoreRef.current;
        if (current) observer.observe(current);
    
        return () => {
          if (current) observer.unobserve(current);
        };
      }, [hasNextPage, fetchNextPage]);

      if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading events</p>;
  
    return (
        <div className="space-y-4">
        {data?.pages.map((page) =>
          page.data.map((event) => (
            <div key={event.id} className="border rounded p-2">
              <p><strong>{event.title}</strong></p>
              <p>{event.timestamp}</p>
              <p>{event.message}</p>
            </div>
          ))
        )}
  
        <div ref={loadMoreRef} className="h-8" />
        {isFetchingNextPage && <p>Loading more...</p>}
      </div>
    );
  };


export default HistoryEventsList;
  
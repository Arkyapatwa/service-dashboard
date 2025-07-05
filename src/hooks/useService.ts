
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type serviceType = "API" | "Database" | "Web Service" | "Microservice"
interface Service {
  id?: string;
  name?: string;
  status?: "online" | "offline" | "degraded";
  type?: serviceType;
}

interface PaginatedServiceResponse {
  data: Service[];
  page: number;
  totalPages: number;
  totalItems: number;
}

interface responseService {
  id: string
}

export const getService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async (): Promise<Service> => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch service');
      }
      return response.json();
    },
  });
};

export const getServices = ( page: number, limit: number ) => {
  return useQuery({
    queryKey: ['services', page, limit],
    queryFn: async (): Promise<PaginatedServiceResponse> => {
      const response = await fetch(`/api/services?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
};

// add a service
export const addService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service: Service): Promise<responseService> => {
      console.log(service)
      console.log("addService")
      const response = await fetch('/api/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
      if (!response.ok) {
        throw new Error('Failed to add service'); 
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// delete s service
export const deleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<responseService> => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// update a service
export const updateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, service }: { id: string; service: Service }): Promise<responseService> => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(service),
      });
      if (!response.ok) {
        throw new Error('Failed to update service');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}


interface Event {
  id: string;
  title: string;
  timestamp: string;
  // add other fields returned by your API
}

interface PaginatedEventsResponse {
  data: Event[];
  page: number;
  totalPages: number;
  totalItems: number;
}

export const getServiceEvents = (serviceId: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ['service-events', serviceId, page, limit],
    queryFn: async (): Promise<PaginatedEventsResponse> => {
      const response = await fetch(`/api/services/${serviceId}/events?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    // pre: true, // optional: keeps old data while fetching new page
  });
};


import { useQuery, useMutation, useQueryClient, keepPreviousData  } from '@tanstack/react-query';

export type serviceType = "API" | "Database" | "Web Service" | "Microservice"
export interface Service {
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

interface ServiceFilters {
  status?: string;
  name_like?: string;
  type?: serviceType;
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

export const getServices = ( page: number, limit: number, filters: ServiceFilters ) => {
  return useQuery({
    queryKey: ['services', page, limit, filters],
    queryFn: async (): Promise<PaginatedServiceResponse> => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.name_like && { name_like: filters.name_like }),
       ...(filters?.type && { type: filters.type }),
      }).toString();
      const response = await fetch(`/api/services?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
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

interface UpdatePayload {
  id: string;
  service: Omit<Service, 'id'>;
}

// update a service
export const updateService = () => {
  const queryClient = useQueryClient();
  return useMutation<responseService, Error, UpdatePayload>({
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

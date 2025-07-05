
import { http, HttpResponse } from 'msw';

interface ServiceInput {
  id?: string;
  name?: string;
  type?: string;
  status?: string; // Default to online
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

const generateMockEvents = (count: number, serviceId: string) => {
  const events = [];
  for (let i = 1; i <= count; i++) {
    events.push({
      id: `${serviceId}-event-${i}`,
      title: `Event ${i}`,
      timestamp: new Date(Date.now() - i * 1000000).toISOString(),
    });
  }
  return events;
};

const generateMockServices = (count: number) => {
  const services = [];
  const types = ["API" , "Database" , "Web Service" , "Microservice"]
  const statuses = ["online", "offline", "degraded"];
  for (let i = 1; i <= count; i++) {
    services.push({
      id: generateUniqueId(),
      name: `Service ${i}`,
      type: types[i % types.length], // Cycle through the types array for each servic
      status: statuses[i % statuses.length], // Cycle through the statuses array for each service,
    });
  }
  return services;
};
const mockServices = generateMockServices(50);

const eventCache: Record<string, any[]> = {};

export const handlers = [
  // Get all services
  http.get('/api/services', ({request}) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');


    const allEvents = mockServices;
    const start = (page - 1) * limit;
    const paginated = allEvents.slice(start, start + limit);

    return HttpResponse.json({
      data: paginated,
      page,
      totalItems: allEvents.length,
      totalPages: Math.ceil(allEvents.length / limit),
    });

  }),

  // Get single service by ID
  http.get('/api/services/:id', ({ params }) => {
    const { id } = params;
    const service = mockServices.find(s => s.id === id);
    
    if (!service) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(service);
  }),

  // Post request to add services
  http.post('/api/services', async ({ request }) => {
    const { name, type } = await request.json() as ServiceInput;
    const newService = { id: generateUniqueId(), name, type, status: "online" };
    mockServices.push(newService);
  
    // return the new added service id
    return HttpResponse.json({ id: newService.id }, { status: 201 });
  }),

  // Put request to update services
  http.put('/api/services/:id', async ({ request, params }) => {
    const { id } = params;
    const { name, type } = await request.json() as ServiceInput;
    const index = mockServices.findIndex(s => s.id === id);
  
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
  
    // Update only name and type
    mockServices[index] = { ...mockServices[index], name, type };
  
    return HttpResponse.json({ id: id });
  }),

  // Delete service by id
  http.delete('/api/services/:id', ({ params }) => {
    const { id } = params;
    const index = mockServices.findIndex(s => s.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    } 

    mockServices.splice(index, 1);

    return HttpResponse.json({ id: id }, {status: 200});
  }),

  
  // paginated events history of a service
  http.get('/api/services/:id/events', ({ params, request }) => {
    const id = String(params.id);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');

    // Initialize if not already generated
    if (!eventCache[id]) {
      eventCache[id] = generateMockEvents(50, id);
    }

    const allEvents = eventCache[id];
    const start = (page - 1) * limit;
    const paginated = allEvents.slice(start, start + limit);

    return HttpResponse.json({
      data: paginated,
      page,
      totalItems: allEvents.length,
      totalPages: Math.ceil(allEvents.length / limit),
    });
  })
];




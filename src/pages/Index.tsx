import { useState, useMemo } from "react";
import { Search, Filter, Plus, MoreHorizontal, Settings, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { getServices, deleteService as useDeleteService } from "@/hooks/useService";
import { AddServiceDialog } from "@/components/dialogBox";
import { useDebounce } from 'use-debounce';
import { useServiceModalStore } from "@/store/serviceModalStore";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<any>("all");
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    name_like: debouncedSearchTerm || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  }), [statusFilter, debouncedSearchTerm, typeFilter]);
  
  // fetching all services 
  const { data, isLoading, error } = getServices(page, limit, filters);
  // delete service
  const deleteMutation = useDeleteService();
  const open = useServiceModalStore((state) => state.open);

  const handleDelete = async (serviceId: string) => {
    deleteMutation.mutate(serviceId, {
      onSuccess: () => {
        toast.success('Service deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete service: ${error.message}`);
      }
    });
    
  };
  const filteredServices = data?.data ?? [];


  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800 border-green-200";
      case "offline": return "bg-gray-100 text-gray-800 border-gray-200";
      case "degraded": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "API": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Database": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Web Service": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Microservice": return "bg-teal-100 text-teal-800 border-teal-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading services</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Monito Corp</h1>
              <p className="text-gray-600">Monitor and manage your application services</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200"
            onClick={() => open('add')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Filters */}
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-gray-200">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40 border-gray-200">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Web Service">Web Service</SelectItem>
                      <SelectItem value="Microservice">Microservice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Services ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700 border-b border-gray-100">Service</th>
                    <th className="text-left p-4 font-medium text-gray-700 border-b border-gray-100 hidden md:table-cell">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700 border-b border-gray-100 hidden lg:table-cell">Status</th>
                    <th className="text-right p-4 font-medium text-gray-700 border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service, index) => (
                    <tr
                      key={service.id}
                      className="hover:bg-gray-50/50 transition-colors duration-150 border-b border-gray-50 last:border-b-0 cursor-pointer"
                      onClick={() => navigate(`/service/${service.id}`)}
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{service.name}</div>
                          {/* <div className="text-sm text-gray-600 hidden sm:block">{service.description}</div> */}
                          <div className="flex gap-2 md:hidden">
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                            <Badge className={getTypeColor(service.type)}>
                              {service.type}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge className={getTypeColor(service.type)}>
                          {service.type}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="hover:bg-blue-50 hover:text-blue-700" onClick={() => open('edit', service)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(service.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No services found</div>
                <div className="text-sm text-gray-500">Try adjusting your search or filters</div>
              </div>
            )}
          </CardContent>
          <CardContent className="hover:bg-gray-50/50 transition-colors duration-150 border-b border-gray-50 last:border-b-0 cursor-pointer">
           <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Prev</Button>
              <Badge  className="bg-white text-gray-800 border-white" >Page {page}</Badge>
              <Button variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>Next</Button>
           </div>
          </CardContent>
        </Card>
      </div>
      <AddServiceDialog />
    </div>
  );
};

export default Index;

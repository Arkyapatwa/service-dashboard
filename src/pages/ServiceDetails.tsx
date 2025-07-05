import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, Clock, AlertCircle, CheckCircle, XCircle, Activity, Server, Database, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getService } from "@/hooks/useService";
import HistoryEventsList from "@/components/serviceHistory";

const ServiceDetails = () => {
  const { id } = useParams();
  const { data: service, isLoading, error } = getService(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading service details...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Service not found</div>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800 border-green-200";
      case "offline": return "bg-gray-100 text-gray-800 border-gray-200";
      case "degraded": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "API": return <Code className="w-4 h-4" />;
      case "Database": return <Database className="w-4 h-4" />;
      case "Web Service": return <Globe className="w-4 h-4" />;
      case "Microservice": return <Server className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {getTypeIcon(service.type)}
              <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            </div>
            <Badge className={getStatusColor(service.status)}>
              {service.status}
            </Badge>
          </div>
          <p className="text-gray-600 text-lg mb-4">{service.name} if of type {service.type}</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-green-600">24hrs</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">200ms</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-orange-600">0.1%</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Requests</p>
                    <p className="text-2xl font-bold text-purple-600">200</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* <div>
                      <p className="text-sm text-gray-600 mb-1">Version</p>
                      <p className="font-medium">version</p>
                    </div> */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Type</p>
                      <Badge className={`${service.type === 'API' ? 'bg-blue-100 text-blue-800' : service.type === 'Database' ? 'bg-purple-100 text-purple-800' : service.type === 'Web Service' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}`}>
                        {service.type}
                      </Badge>
                    </div>
                    {/* <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Endpoint</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">endpoint</p>
                    </div> */}
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Dependencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{dep}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>

          {/* <TabsContent value="monitoring" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Health Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {service.healthChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getHealthIcon(check.status)}
                        <div>
                          <p className="font-medium capitalize">{check.status}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(check.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{check.responseTime}ms</p>
                        <p className="text-sm text-gray-600">Response Time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryEventsList serviceId={service.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ServiceDetails;

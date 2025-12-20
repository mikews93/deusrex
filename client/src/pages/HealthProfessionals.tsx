import { useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { formatProfessionalDisplayName } from "@/utils/professional-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Users,
  Stethoscope,
  Clock,
  Edit,
  MoreHorizontal,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HealthProfessionals() {
  const navigate = useNavigate();

  const {
    data: healthProfessionalsData,
    isLoading,
    error,
  } = trpc["health-professionals"].getAll.useQuery();

  const { data: statistics, isLoading: statsLoading } =
    trpc["health-professionals"].getStatistics.useQuery();

  // Handle both array and paginated responses
  const healthProfessionals = Array.isArray(healthProfessionalsData)
    ? healthProfessionalsData
    : healthProfessionalsData?.data || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "nurse":
        return "bg-green-100 text-green-800";
      case "specialist":
        return "bg-purple-100 text-purple-800";
      case "therapist":
        return "bg-orange-100 text-orange-800";
      case "technician":
        return "bg-yellow-100 text-yellow-800";
      case "administrator":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const handleViewProfile = (healthProfessionalId: number) => {
    navigate(`/health-professionals/${healthProfessionalId}`);
  };

  const handleEditProfile = (healthProfessionalId: number) => {
    navigate(`/health-professionals/${healthProfessionalId}?edit=true`);
  };

  const handleCreateHealthProfessional = () => {
    navigate("/health-professionals/new");
  };

  const formatSpecialty = (specialty: string) => {
    return specialty
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Health Professionals
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your healthcare team and staff
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateHealthProfessional}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Professional
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">
                    Failed to load health professionals
                  </p>
                </div>
              )}

              {/* Loading State */}
              {(isLoading || statsLoading) && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Statistics Cards */}
              {!statsLoading && !isLoading && !error && statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.total}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Active
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.active}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Available
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.available}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 rounded-full bg-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Inactive
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.inactive}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 rounded-full bg-red-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Unavailable
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.unavailable}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Health Professionals Grid */}
              {!isLoading && !error && healthProfessionals.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Health Professionals Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get started by adding your first health professional to
                      the system.
                    </p>
                    <Button
                      onClick={handleCreateHealthProfessional}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Professional
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && healthProfessionals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthProfessionals.map((professional) => (
                    <Card
                      key={professional.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewProfile(professional.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {professional.firstName.charAt(0)}
                              {professional.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {formatProfessionalDisplayName(
                                  professional,
                                  true
                                )}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={`text-xs ${getAvailabilityColor(
                                    professional.isAvailable
                                  )}`}
                                >
                                  {professional.isAvailable
                                    ? "Available"
                                    : "Busy"}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewProfile(professional.id);
                                      }}
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProfile(professional.id);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Profile
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getTypeColor(
                                    professional.type
                                  )}`}
                                >
                                  {professional.type.charAt(0).toUpperCase() +
                                    professional.type.slice(1)}
                                </Badge>
                                {professional.specialty && (
                                  <Badge variant="outline" className="text-xs">
                                    {formatSpecialty(professional.specialty)}
                                  </Badge>
                                )}
                              </div>
                              {professional.email && (
                                <p className="text-sm text-gray-600 truncate">
                                  {professional.email}
                                </p>
                              )}
                              {professional.phone && (
                                <p className="text-sm text-gray-600">
                                  {professional.phone}
                                </p>
                              )}
                              {professional.licenseNumber && (
                                <p className="text-xs text-gray-500">
                                  License: {professional.licenseNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {professional.bio && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {professional.bio}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

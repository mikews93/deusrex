import { Search, Plus, Filter, MoreHorizontal, User, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { DeletePatientButton } from "@/components/forms/DeletePatientButton";

const Patients = () => {
  const navigate = useNavigate();
  const {
    data: patientsData,
    isLoading,
    error,
  } = trpc.patients.getAll.useQuery();

  // Handle both array and paginated responses
  const patients = Array.isArray(patientsData)
    ? patientsData
    : patientsData?.data || [];

  const handleViewProfile = (patientId: number) => {
    navigate(`/patients/${patientId}`);
  };

  const handleEditProfile = (patientId: number) => {
    navigate(`/patients/${patientId}?edit=true`);
  };

  const handleCreatePatient = () => {
    navigate("/patients/new");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Patients
                </h1>
                <p className="text-muted-foreground">
                  Manage and monitor patient information
                </p>
              </div>
              <Button
                onClick={handleCreatePatient}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search patients..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Failed to load patients</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!patients || patients.length === 0) && (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No patients found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first patient to the system.
                </p>
                <Button
                  onClick={handleCreatePatient}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </div>
            )}

            {/* Patients Grid */}
            {patients && patients.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="hover:shadow-medium transition-shadow cursor-pointer"
                    onClick={() => handleViewProfile(patient.id!)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={patient.isActive ? "default" : "secondary"}
                          >
                            {patient.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(patient.id!);
                                }}
                              >
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProfile(patient.id!);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <DeletePatientButton
                                  patientId={patient.id}
                                  patientName={`${patient.firstName} ${patient.lastName}`}
                                  trigger={
                                    <div className="flex items-center w-full text-red-600">
                                      <span>Delete Patient</span>
                                    </div>
                                  }
                                />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p
                            className="font-medium truncate"
                            title={patient.email || "N/A"}
                          >
                            {patient.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p
                            className="font-medium truncate"
                            title={patient.phone || "N/A"}
                          >
                            {patient.phone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sex</p>
                          <p
                            className="font-medium truncate"
                            title={patient.sex || "N/A"}
                          >
                            {patient.sex || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date of Birth</p>
                          <p
                            className="font-medium truncate"
                            title={patient.dateOfBirth || "N/A"}
                          >
                            {patient.dateOfBirth || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Medical History
                        </p>
                        <p
                          className="font-medium truncate"
                          title={patient.medicalHistory || "No history"}
                        >
                          {patient.medicalHistory || "No history"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Patients;

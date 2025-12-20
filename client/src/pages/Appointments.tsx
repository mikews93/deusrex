import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, Search, List, Plus } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  CreateAppointmentForm,
  initialNewAppointment,
} from "@/components/forms/CreateAppointmentForm";
import { AppointmentCalendar } from "@/components/dashboard/AppointmentCalendar";
import { AppointmentDetailsDialog } from "@/components/dialogs/AppointmentDetailsDialog";
import {
  AppointmentFilters,
  AppointmentFilters as AppointmentFiltersType,
} from "@/components/forms/AppointmentFilters";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAppointmentFilters } from "@/hooks/useAppointmentFilters";
import { formatProfessionalName } from "@/utils/professional-utils";
import {
  getAppointmentStatusBadgeVariant,
  getAppointmentPriorityBadgeVariant,
} from "@/utils/badge-utils";
import { toast } from "@/hooks/use-toast";
import capitalize from "lodash/capitalize";

const Appointments = () => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");

  const { filters, updateFilters, updateFilter } = useAppointmentFilters();

  // tRPC mutations
  const utils = trpc.useUtils();
  const deleteAppointment = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
      refetch();
      utils.appointments.getAll.invalidate();
      setIsViewDialogOpen(false);
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle appointment click
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  // Handle delete appointment
  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      deleteAppointment.mutate(selectedAppointment.id);
    }
  };

  // Get current time for "New Appointment" button
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Handle "New Appointment" button click
  const handleNewAppointmentClick = () => {
    setSelectedAppointment({
      ...initialNewAppointment,
      startTime: getCurrentTime(),
    });
    setIsCreateDialogOpen(true);
  };

  // Set default URL parameters if none exist
  useEffect(() => {
    if (
      !filters.sortBy ||
      !filters.sortOrder ||
      !filters.appointmentDateFrom ||
      !filters.appointmentDateTo
    ) {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      updateFilters({
        sortBy: "appointmentDate",
        sortOrder: "asc",
        appointmentDateFrom: startOfDay.toISOString(),
        appointmentDateTo: endOfDay.toISOString(),
      });
    }
  }, [
    filters.sortBy,
    filters.sortOrder,
    filters.appointmentDateFrom,
    filters.appointmentDateTo,
    updateFilters,
  ]);

  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = trpc.appointments.getAll.useQuery({
    ...filters,
    with: JSON.stringify({ patient: true, healthProfessional: true }),
  });

  const { data: patientsData } = trpc.patients.getAll.useQuery();

  // Handle both array and paginated responses for patients
  const patients = Array.isArray(patientsData)
    ? patientsData
    : patientsData?.data || [];

  // Since paginated is false, appointmentsData should be a simple array
  const appointments = (appointmentsData as any[]) || [];
  const totalAppointments = appointments.length;

  // Handler functions using the custom hook
  const handleFiltersChange = (newFilters: AppointmentFiltersType) => {
    updateFilters(newFilters);
  };

  const handleSearchChange = (searchValue: string) => {
    updateFilter("search", searchValue || undefined);
  };

  const handleClearFilters = () => {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    // Reset to today's appointments with default sorting
    updateFilters({
      sortBy: "appointmentDate",
      sortOrder: "asc",
      appointmentDateFrom: startOfDay.toISOString(),
      appointmentDateTo: endOfDay.toISOString(),
      // Clear all other filters
      search: undefined,
      status: undefined,
      appointmentType: undefined,
      priority: undefined,
      patientId: undefined,
      healthProfessionalId: undefined,
      roomNumber: undefined,
      location: undefined,
    });
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleEdit = () => {
    if (!selectedAppointment) return;

    // Close the details dialog
    setIsViewDialogOpen(false);

    // Open create dialog in edit mode with the selected appointment data
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setSelectedAppointment(null);
  };

  const isToday = useMemo(() => {
    return (
      new Date().toISOString().split("T")[0] ===
      filters.appointmentDateFrom.split("T")[0]
    );
  }, [filters.appointmentDateFrom]);

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
                  Appointments
                </h1>
                <p className="text-muted-foreground">
                  Schedule and manage patient appointments
                </p>
              </div>
              <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={handleNewAppointmentClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10"
                    value={filters.search || ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                <AppointmentFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  patients={patients}
                  healthProfessionals={[]}
                />
              </div>
              <SegmentedControl
                value={viewMode}
                onValueChange={(value) =>
                  setViewMode(value as "list" | "calendar")
                }
                options={[
                  {
                    value: "list",
                    label: "List",
                    icon: <List className="h-4 w-4" />,
                  },
                  {
                    value: "calendar",
                    label: "Calendar",
                    icon: <Calendar className="h-4 w-4" />,
                  },
                ]}
              />
            </div>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Failed to load appointments</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}

            {viewMode === "calendar" ? (
              <AppointmentCalendar
                appointments={appointments}
                isLoading={isLoading}
                refetch={refetch}
              />
            ) : (
              <>
                {/* Empty State */}
                {!isLoading &&
                  !error &&
                  (!appointments || appointments.length === 0) && (
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No appointments found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by scheduling your first appointment.
                      </p>
                      <Button
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={handleNewAppointmentClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                      </Button>
                    </div>
                  )}

                {appointments && appointments.length > 0 && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {appointments.length} of {totalAppointments}{" "}
                    appointments
                  </div>
                )}

                {appointments && appointments.length > 0 && !isLoading && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {filters.search ||
                        Object.keys(filters).some(
                          (key) =>
                            key !== "page" &&
                            key !== "limit" &&
                            key !== "sortBy" &&
                            key !== "sortOrder" &&
                            filters[key as keyof AppointmentFiltersType]
                        )
                          ? "Filtered Appointments"
                          : `Today's Schedule - ${new Date().toLocaleDateString()}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-primary" />
                                {appointment.startTime
                                  ? new Date(
                                      appointment.startTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {appointment.patient
                                    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                    : "Unknown Patient"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {[
                                    capitalize(appointment.appointmentType),
                                    appointment.duration + " min",
                                    formatProfessionalName(
                                      appointment.healthProfessional
                                    ),
                                  ].join(" • ")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getAppointmentStatusBadgeVariant(
                                  appointment.status
                                )}
                              >
                                {capitalize(appointment.status)}
                              </Badge>
                              <Badge
                                variant={getAppointmentPriorityBadgeVariant(
                                  appointment.priority
                                )}
                              >
                                {capitalize(appointment.priority)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <AppointmentDetailsDialog
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={handleDeleteAppointment}
        isDeleting={deleteAppointment.isPending}
      />

      {/* Create Appointment Form - Independent Dialog */}
      <CreateAppointmentForm
        open={isCreateDialogOpen}
        appointment={selectedAppointment}
        onClose={handleCloseCreateDialog}
      />
    </div>
  );
};

export default Appointments;

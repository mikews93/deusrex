import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

export interface AppointmentFilters {
  search?: string;
  status?:
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  appointmentType?:
    | "consultation"
    | "follow_up"
    | "emergency"
    | "routine_checkup"
    | "specialist_visit";
  priority?: "low" | "normal" | "high" | "urgent";
  patientId?: number;
  healthProfessionalId?: number;
  appointmentDateFrom?: string;
  appointmentDateTo?: string;
  roomNumber?: string;
  location?: string;
  paginated?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface AppointmentFiltersProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: AppointmentFilters) => void;
  onClearFilters: () => void;
  patients?: Array<{ id: number; firstName: string; lastName: string }>;
  healthProfessionals?: Array<{
    id: number;
    firstName: string;
    lastName: string;
  }>;
}

export const AppointmentFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  patients = [],
  healthProfessionals = [],
}: AppointmentFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<AppointmentFilters>(filters);

  // Update tempFilters when filters prop changes (from URL parameters)
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    // Convert "all" values to undefined to clear the filter
    const filterValue = value === "all" ? undefined : value;
    setTempFilters((prev) => ({
      ...prev,
      [key]: filterValue,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    onClearFilters();
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    // Get today's date range for comparison
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

    return Object.entries(filters).filter(([key, value]) => {
      // Skip pagination-related fields, search, and default values
      if (
        key === "paginated" ||
        key === "page" ||
        key === "limit" ||
        key === "search"
      ) {
        return false;
      }
      // Skip default sorting values
      if (key === "sortBy" && value === "appointmentDate") {
        return false;
      }
      if (key === "sortOrder" && value === "asc") {
        return false;
      }
      // Skip default date filters (today's range)
      if (key === "appointmentDateFrom" && value === startOfDay.toISOString()) {
        return false;
      }
      if (key === "appointmentDateTo" && value === endOfDay.toISOString()) {
        return false;
      }
      // Count only meaningful filter values
      return value !== undefined && value !== null && value !== "";
    }).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[90vw] max-h-[80vh]" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Appointments</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={tempFilters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select
                value={tempFilters.appointmentType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("appointmentType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine_checkup">
                    Routine Checkup
                  </SelectItem>
                  <SelectItem value="specialist_visit">
                    Specialist Visit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={tempFilters.priority || "all"}
                onValueChange={(value) => handleFilterChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient */}
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select
                value={tempFilters.patientId?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "patientId",
                    value === "all" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All patients</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Health Professional */}
            <div className="space-y-2">
              <Label>Health Professional</Label>
              <Select
                value={tempFilters.healthProfessionalId?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "healthProfessionalId",
                    value === "all" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All professionals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All professionals</SelectItem>
                  {healthProfessionals.map((professional) => (
                    <SelectItem
                      key={professional.id}
                      value={professional.id.toString()}
                    >
                      {professional.firstName} {professional.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="appointmentDateFrom"
                    className="text-xs text-muted-foreground"
                  >
                    From
                  </Label>
                  <Input
                    id="appointmentDateFrom"
                    type="date"
                    value={
                      tempFilters.appointmentDateFrom
                        ? new Date(tempFilters.appointmentDateFrom)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "appointmentDateFrom",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="appointmentDateTo"
                    className="text-xs text-muted-foreground"
                  >
                    To
                  </Label>
                  <Input
                    id="appointmentDateTo"
                    type="date"
                    value={
                      tempFilters.appointmentDateTo
                        ? new Date(tempFilters.appointmentDateTo)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "appointmentDateTo",
                        e.target.value
                          ? new Date(
                              e.target.value + "T23:59:59.999Z"
                            ).toISOString()
                          : undefined
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                placeholder="e.g., Room 101"
                value={tempFilters.roomNumber || ""}
                onChange={(e) =>
                  handleFilterChange("roomNumber", e.target.value || undefined)
                }
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Main Building"
                value={tempFilters.location || ""}
                onChange={(e) =>
                  handleFilterChange("location", e.target.value || undefined)
                }
              />
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={tempFilters.sortBy || "appointmentDate"}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointmentDate">
                      Appointment Date
                    </SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={tempFilters.sortOrder || "asc"}
                  onValueChange={(value: "asc" | "desc") =>
                    handleFilterChange("sortOrder", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

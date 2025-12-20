import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Stethoscope } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatProfessionalDisplayName } from "@/utils/professional-utils";
import {
  Appointment,
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
} from "@/types";

// Default appointment duration in minutes - can be easily changed here
export const DEFAULT_APPOINTMENT_DURATION = 60;

export const initialNewAppointment: Partial<Appointment> = {
  patientId: 0,
  healthProfessionalId: 0,
  appointmentDate: new Date().toISOString(),
  duration: DEFAULT_APPOINTMENT_DURATION,
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  appointmentType: AppointmentType.CONSULTATION,
  status: AppointmentStatus.SCHEDULED,
  priority: AppointmentPriority.NORMAL,
};

interface CreateAppointmentFormProps {
  appointment?: Partial<Appointment>;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function CreateAppointmentForm({
  appointment,
  open: externalOpen,
  onOpen,
  onClose,
}: CreateAppointmentFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialNewAppointment);

  // Initialize form with appointment data
  useEffect(() => {
    if (appointment) {
      const newFormData = { ...formData };

      // Populate form with appointment data
      if (appointment.patientId) {
        newFormData.patientId = appointment.patientId;
      }
      if (appointment.healthProfessionalId) {
        newFormData.healthProfessionalId = appointment.healthProfessionalId;
      }
      if (appointment.appointmentDate) {
        const date = new Date(appointment.appointmentDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        newFormData.appointmentDate = `${year}-${month}-${day}`;
      }
      if (appointment.startTime) {
        const startDate = new Date(appointment.startTime);
        const hours = String(startDate.getHours()).padStart(2, "0");
        const minutes = String(startDate.getMinutes()).padStart(2, "0");
        newFormData.startTime = `${hours}:${minutes}`;
      }
      if (appointment.duration) {
        newFormData.duration = appointment.duration;
      }
      if (appointment.appointmentType) {
        newFormData.appointmentType = appointment.appointmentType;
      }
      if (appointment.status) {
        newFormData.status = appointment.status;
      }
      if (appointment.priority) {
        newFormData.priority = appointment.priority;
      }
      if (appointment.description) {
        newFormData.description = appointment.description;
      }
      if (appointment.notes) {
        newFormData.notes = appointment.notes;
      }
      if (appointment.symptoms) {
        newFormData.symptoms = appointment.symptoms;
      }
      if (appointment.roomNumber) {
        newFormData.roomNumber = appointment.roomNumber;
      }
      if (appointment.location) {
        newFormData.location = appointment.location;
      }

      // Calculate end time if we have all required values
      if (
        newFormData.appointmentDate &&
        newFormData.startTime &&
        newFormData.duration
      ) {
        newFormData.endTime = calculateEndTime(
          newFormData.appointmentDate,
          newFormData.startTime,
          newFormData.duration
        );
      }

      setFormData(newFormData);
    }
  }, [appointment]);

  // Function to calculate end time based on appointment date, start time, and duration
  const calculateEndTime = (
    date: string,
    startTime: string,
    duration: number
  ) => {
    if (!date || !startTime || !duration) return "";

    const appointmentDateTime = new Date(`${date}T${startTime}`);
    const durationMinutes = duration;

    if (isNaN(durationMinutes)) return "";

    const endDateTime = new Date(
      appointmentDateTime.getTime() + durationMinutes * 60000
    );

    // Format as datetime-local string
    const year = endDateTime.getFullYear();
    const month = String(endDateTime.getMonth() + 1).padStart(2, "0");
    const day = String(endDateTime.getDate()).padStart(2, "0");
    const hours = String(endDateTime.getHours()).padStart(2, "0");
    const minutes = String(endDateTime.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get current time in HH:MM format for time input min attribute
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Check if the selected date is today
  const isToday = (date: string) => {
    return date === getTodayDate();
  };

  // Fetch patients and health professionals with user information
  const { data: patientsData, isLoading: patientsLoading } =
    trpc.patients.getAll.useQuery();
  const {
    data: healthProfessionalsData,
    isLoading: healthProfessionalsLoading,
  } = trpc["health-professionals"].getAll.useQuery();

  // Handle both array and paginated responses
  const patients = Array.isArray(patientsData)
    ? patientsData
    : patientsData?.data || [];
  const healthProfessionals = Array.isArray(healthProfessionalsData)
    ? healthProfessionalsData
    : healthProfessionalsData?.data || [];

  // Get current user for organizationId
  const { data: currentUser } = trpc.auth.me.useQuery();

  const utils = trpc.useUtils();

  // Determine if we're in edit mode
  const isEditMode = appointment?.id !== undefined;
  const dialogTitle = isEditMode ? "Edit Appointment" : "Add New Appointment";
  const submitButtonText = isEditMode
    ? "Update Appointment"
    : "Create Appointment";

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Appointment created successfully");
      if (externalOpen === undefined) {
        setInternalOpen(false);
      }
      if (onClose) {
        onClose();
      }
      setFormData(initialNewAppointment);
      // Invalidate and refetch appointments list
      utils.appointments.getAll.invalidate();
      // Call onClose callback if provided
      if (onClose) {
        onClose();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create appointment");
    },
  });

  const updateAppointment = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Appointment updated successfully");
      if (externalOpen === undefined) {
        setInternalOpen(false);
      }
      if (onClose) {
        onClose();
      }
      resetForm();
      utils.appointments.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update appointment");
    },
  });

  const resetForm = () => {
    setFormData(initialNewAppointment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.user?.organizationId) {
      toast.error("Organization not found");
      return;
    }

    // Validate that the appointment is not in the past
    const appointmentDateTime = new Date(
      `${formData.appointmentDate}T${formData.startTime}`
    );
    const now = new Date();

    if (appointmentDateTime <= now) {
      toast.error("Cannot schedule appointments in the past");
      return;
    }

    const endDateTime = new Date(formData.endTime);

    const appointmentData = {
      organizationId: currentUser.user.organizationId,
      patientId: formData.patientId || 0,
      healthProfessionalId: formData.healthProfessionalId || 0,
      duration: formData.duration || 0,
      appointmentDate: appointmentDateTime.toISOString(),
      startTime: appointmentDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      appointmentType: formData.appointmentType,
      status: formData.status,
      priority: formData.priority,
      description: formData.description,
      notes: formData.notes,
      symptoms: formData.symptoms,
      roomNumber: formData.roomNumber,
      location: formData.location,
    } as any;

    // Use appropriate mutation based on mode
    if (isEditMode && appointment?.id) {
      updateAppointment.mutate({ id: appointment.id, ...appointmentData });
    } else {
      createAppointment.mutate(appointmentData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Check if it's a create option
    if (value === "create-patient") {
      handleCreateOption("patient");
      return;
    }
    if (value === "create-health-professional") {
      handleCreateOption("health-professional");
      return;
    }

    const newFormData = {
      ...formData,
      [field]: value,
    };

    // If date changes to today and current start time is in the past, clear it
    if (field === "appointmentDate" && isToday(value) && formData.startTime) {
      const currentTime = getCurrentTime();
      if (formData.startTime < currentTime) {
        newFormData.startTime = "";
        newFormData.endTime = "";
      }
    }

    // Auto-calculate end time when date, start time, or duration changes
    if (
      field === "appointmentDate" ||
      field === "startTime" ||
      field === "duration"
    ) {
      const calculatedEndTime = calculateEndTime(
        field === "appointmentDate" ? value : newFormData.appointmentDate,
        field === "startTime" ? value : newFormData.startTime,
        field === "duration" ? parseInt(value) : newFormData.duration
      );
      newFormData.endTime = calculatedEndTime;
    }

    setFormData(newFormData);
  };

  const handleCreateOption = (type: "patient" | "health-professional") => {
    if (externalOpen === undefined) {
      setInternalOpen(false);
    }
    if (onClose) {
      onClose();
    }
    if (type === "patient") {
      navigate("/patients/new");
    } else {
      navigate("/health-professionals/new");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (externalOpen === undefined) {
      setInternalOpen(newOpen);
    }
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Enter the appointment's information below. All fields marked with *
            are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientId">Patient *</Label>
              <Select
                value={formData.patientId.toString()}
                onValueChange={(value) => handleInputChange("patientId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading patients...
                    </SelectItem>
                  ) : patients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>
                      No patients found
                    </SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={patient.user?.imageUrl}
                              alt={`${patient.firstName} ${patient.lastName}`}
                            />
                            <AvatarFallback className="text-xs">
                              {patient.firstName?.charAt(0)}
                              {patient.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {patient.firstName} {patient.lastName}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                  <SelectItem
                    value="create-patient"
                    className="text-blue-600 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create new patient
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="healthProfessionalId">
                Health Professional *
              </Label>
              <Select
                value={formData.healthProfessionalId.toString()}
                onValueChange={(value) =>
                  handleInputChange("healthProfessionalId", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a health professional" />
                </SelectTrigger>
                <SelectContent>
                  {healthProfessionalsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading health professionals...
                    </SelectItem>
                  ) : healthProfessionals.length === 0 ? (
                    <SelectItem value="no-professionals" disabled>
                      No health professionals found
                    </SelectItem>
                  ) : (
                    healthProfessionals.map((professional) => (
                      <SelectItem
                        key={professional.id}
                        value={professional.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={professional.user?.imageUrl}
                              alt={`${professional.firstName} ${professional.lastName}`}
                            />
                            <AvatarFallback className="text-xs">
                              {professional.firstName?.charAt(0)}
                              {professional.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {formatProfessionalDisplayName(professional, true)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                  <SelectItem
                    value="create-health-professional"
                    className="text-blue-600 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Create new health professional
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointmentDate">Appointment Date *</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                min={getTodayDate()}
                onChange={(e) =>
                  handleInputChange("appointmentDate", e.target.value)
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                required
                placeholder="e.g., 30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                min={
                  isToday(formData.appointmentDate)
                    ? getCurrentTime()
                    : undefined
                }
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time (Calculated)</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                readOnly
                className="bg-muted"
                placeholder="Will be calculated automatically"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) =>
                  handleInputChange("appointmentType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
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
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) =>
                  handleInputChange("roomNumber", e.target.value)
                }
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Main Building"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter appointment description..."
            />
          </div>

          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              placeholder="Enter patient symptoms..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter additional notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (externalOpen === undefined) {
                  setInternalOpen(false);
                }
                if (onClose) {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createAppointment.isPending || updateAppointment.isPending
              }
            >
              {createAppointment.isPending || updateAppointment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

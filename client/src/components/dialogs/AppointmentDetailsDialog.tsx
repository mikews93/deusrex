import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import { formatProfessionalName } from "@/utils/professional-utils";
import {
  getAppointmentStatusBadgeVariant,
  getAppointmentPriorityBadgeVariant,
} from "@/utils/badge-utils";
import capitalize from "lodash/capitalize";

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function AppointmentDetailsDialog({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  isDeleting = false,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View and manage appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Patient:</span>
              <span>
                {appointment.patient
                  ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                  : `ID: ${appointment.patientId}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span className="capitalize">
                {appointment.appointmentType?.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Start:</span>
              <span>
                {appointment.startTime
                  ? new Date(appointment.startTime).toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">End:</span>
              <span>
                {appointment.endTime
                  ? new Date(appointment.endTime).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge
                variant={getAppointmentStatusBadgeVariant(appointment.status)}
              >
                {capitalize(appointment.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Priority:</span>
              <Badge
                variant={getAppointmentPriorityBadgeVariant(
                  appointment.priority
                )}
              >
                {capitalize(appointment.priority)}
              </Badge>
            </div>
          </div>

          {appointment.healthProfessional && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Health Professional:</span>
              <span>
                {formatProfessionalName(appointment.healthProfessional)}
              </span>
            </div>
          )}

          {appointment.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duration:</span>
              <span>{appointment.duration} minutes</span>
            </div>
          )}

          {appointment.roomNumber && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Room:</span>
              <span>{appointment.roomNumber}</span>
            </div>
          )}

          {appointment.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{appointment.location}</span>
            </div>
          )}

          {appointment.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {appointment.description}
              </p>
            </div>
          )}

          {appointment.notes && (
            <div>
              <span className="font-medium">Notes:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {appointment.notes}
              </p>
            </div>
          )}

          {appointment.symptoms && (
            <div>
              <span className="font-medium">Symptoms:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {appointment.symptoms}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

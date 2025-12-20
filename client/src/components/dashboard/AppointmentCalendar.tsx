import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@/styles/fullcalendar-custom.css";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppointmentDetailsDialog } from "@/components/dialogs/AppointmentDetailsDialog";
import {
  CreateAppointmentForm,
  initialNewAppointment,
} from "@/components/forms/CreateAppointmentForm";
import {
  appointmentsToEvents,
  CalendarEvent,
  eventToAppointment,
} from "@/utils/appointment-utils";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import { Appointment } from "@/types";

interface AppointmentCalendarProps {
  appointments: any[];
  isLoading: boolean;
  refetch: () => void;
}

export function AppointmentCalendar({
  appointments,
  isLoading,
  refetch,
}: AppointmentCalendarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Partial<Appointment> | null>(null);

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

  // Convert appointments to FullCalendar events using utility function
  const events: CalendarEvent[] = appointmentsToEvents(appointments || []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Return if the start date is in the past
    if (selectInfo.start < new Date()) {
      return;
    }

    const newAppointment: Partial<Appointment> = initialNewAppointment;

    if (selectInfo.view.type !== "dayGridMonth") {
      const duration = selectInfo.end.getTime() - selectInfo.start.getTime();
      const durationInMinutes = duration / 60000;
      newAppointment.duration = durationInMinutes;
    }
    newAppointment.appointmentDate = selectInfo.start.toISOString();
    newAppointment.startTime = selectInfo.start.toISOString();
    setSelectedAppointment(newAppointment);
    setIsCreateDialogOpen(true);
  };

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    setSelectedAppointment(
      eventToAppointment(clickInfo.event as unknown as CalendarEvent)
    );
    setIsViewDialogOpen(true);
  }, []);

  const handleEdit = () => {
    if (!selectedAppointment) return;

    setIsViewDialogOpen(false);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedAppointment || !selectedAppointment.id) return;

    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointment.mutate({ id: selectedAppointment.id });
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleSelectAllow = (selectInfo: DateSelectArg) => {
    const currentDate = new Date().toISOString();
    if (selectInfo.start.toISOString() < currentDate) {
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader />
        <CardContent>
          <div className="h-[600px]">
            <FullCalendar
              key={events.length}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              initialView="dayGridMonth"
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="100%"
              eventColor="hsl(var(--primary))"
              eventTextColor="hsl(var(--primary-foreground))"
              dayHeaderFormat={{ weekday: "short" }}
              selectAllow={handleSelectAllow}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
              themeSystem="standard"
            />
          </div>
        </CardContent>
      </Card>

      <CreateAppointmentForm
        open={isCreateDialogOpen}
        appointment={selectedAppointment}
        onClose={handleCloseCreateDialog}
      />

      <AppointmentDetailsDialog
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteAppointment.isPending}
      />
    </div>
  );
}

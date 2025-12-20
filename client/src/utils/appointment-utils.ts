import capitalize from "lodash/capitalize";
import {
  Appointment,
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
} from "@/types";

/**
 * Calendar event interface for FullCalendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    patientId: string;
    patientName?: string;
    healthProfessionalId?: string;
    healthProfessionalName?: string;
    appointmentType: string;
    status: string;
    priority: string;
    duration: number;
    description?: string;
    notes?: string;
    symptoms?: string;
    roomNumber?: string;
    location?: string;
  };
}

/**
 * Convert an appointment to a calendar event
 * @param appointment - The appointment object
 * @returns Calendar event object for FullCalendar
 */
export function appointmentToEvent(appointment: Appointment): CalendarEvent {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);

  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error(
      "Invalid date encountered for appointment:",
      appointment.id,
      appointment.startTime,
      appointment.endTime
    );
    throw new Error("Invalid appointment dates");
  }

  // Build patient name
  const patientName = appointment.patient
    ? `${appointment.patient.firstName || ""} ${
        appointment.patient.lastName || ""
      }`.trim()
    : undefined;

  // Build health professional name
  const healthProfessionalName = appointment.healthProfessional
    ? `${appointment.healthProfessional.firstName || ""} ${
        appointment.healthProfessional.lastName || ""
      }`.trim()
    : undefined;

  return {
    id: appointment.id.toString(),
    title: `${capitalize(appointment.appointmentType)} - ${
      patientName || "Unknown Patient"
    }`,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    extendedProps: {
      patientId: appointment.patientId,
      patientName,
      healthProfessionalId: appointment.healthProfessionalId,
      healthProfessionalName,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
      priority: appointment.priority,
      duration: appointment.duration,
      description: appointment.description,
      notes: appointment.notes,
      symptoms: appointment.symptoms,
      roomNumber: appointment.roomNumber,
      location: appointment.location,
    },
  };
}

/**
 * Convert a calendar event to an appointment object
 * @param event - The calendar event object
 * @returns Partial appointment object
 */
export function eventToAppointment(event: CalendarEvent): Partial<Appointment> {
  return {
    id: event.id,
    patientId: event.extendedProps.patientId,
    healthProfessionalId: event.extendedProps.healthProfessionalId || "",
    appointmentDate: event.start,
    startTime: event.start,
    endTime: event.end,
    duration: event.extendedProps.duration,
    appointmentType: event.extendedProps.appointmentType as AppointmentType,
    status: event.extendedProps.status as AppointmentStatus,
    priority: event.extendedProps.priority as AppointmentPriority,
    description: event.extendedProps.description,
    notes: event.extendedProps.notes,
    symptoms: event.extendedProps.symptoms,
    roomNumber: event.extendedProps.roomNumber,
    location: event.extendedProps.location,
  };
}

/**
 * Convert multiple appointments to calendar events
 * @param appointments - Array of appointment objects
 * @returns Array of calendar event objects
 */
export function appointmentsToEvents(
  appointments: Appointment[]
): CalendarEvent[] {
  return appointments
    .map((appointment) => {
      try {
        return appointmentToEvent(appointment);
      } catch (error) {
        console.error(
          "Failed to convert appointment to event:",
          appointment.id,
          error
        );
        return null;
      }
    })
    .filter((event): event is CalendarEvent => event !== null);
}

/**
 * Convert multiple calendar events to appointments
 * @param events - Array of calendar event objects
 * @returns Array of partial appointment objects
 */
export function eventsToAppointments(
  events: CalendarEvent[]
): Partial<Appointment>[] {
  return events.map(eventToAppointment);
}

/**
 * Create a calendar event from appointment data for editing
 * @param appointment - The appointment object
 * @returns Calendar event object with all necessary data for editing
 */
export function createEventForEditing(appointment: Appointment): CalendarEvent {
  const event = appointmentToEvent(appointment);

  // Ensure we have all the necessary data for editing
  return {
    ...event,
    extendedProps: {
      ...event.extendedProps,
      // Ensure we have the health professional ID for editing
      healthProfessionalId: appointment.healthProfessionalId,
    },
  };
}

/**
 * Extract appointment data from a calendar event for form population
 * @param event - The calendar event object
 * @returns Partial appointment object suitable for form population
 */
export function extractAppointmentFromEvent(
  event: CalendarEvent
): Partial<Appointment> {
  return {
    id: event.id,
    patientId: event.extendedProps.patientId,
    healthProfessionalId: event.extendedProps.healthProfessionalId || "",
    appointmentDate: event.start,
    startTime: event.start,
    endTime: event.end,
    duration: event.extendedProps.duration,
    appointmentType: event.extendedProps.appointmentType as AppointmentType,
    status: event.extendedProps.status as AppointmentStatus,
    priority: event.extendedProps.priority as AppointmentPriority,
    description: event.extendedProps.description,
    notes: event.extendedProps.notes,
    symptoms: event.extendedProps.symptoms,
    roomNumber: event.extendedProps.roomNumber,
    location: event.extendedProps.location,
  };
}
